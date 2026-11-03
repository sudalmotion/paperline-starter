import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Visual minimums per scene type: data scenes need time to animate even with short narration. */
export const MIN_SCENE = { title: 3, chapter: 2.5, bigNumber: 3, bars: 4, progress: 3.5, document: 4, versus: 4, figure: 3, timeline: 4.5, list: 4, quote: 4, line: 4.5, photo: 4, map: 4.5 };

/** Accepts "demo", "projects/demo" or a path to video.json. */
export const resolveProject = (arg) => {
  if (!arg) throw new Error("Pass a project name, e.g. `npm run still -- demo`");
  let p = path.resolve(ROOT, arg);
  if (!fs.existsSync(p)) p = path.resolve(ROOT, "projects", arg);
  const file = p.endsWith(".json") ? p : path.join(p, "video.json");
  if (!fs.existsSync(file)) throw new Error(`Not found: ${file}`);
  return { dir: path.dirname(file), file, name: path.basename(path.dirname(file)) };
};

export const readSpec = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

/** Runs validate.mjs first; stops here if the video file has errors. */
export const validateOrExit = (arg) => {
  try {
    execFileSync(process.execPath, [path.join(ROOT, "scripts", "validate.mjs"), arg], { stdio: "inherit" });
  } catch {
    console.log("✗ Fix the errors above, then run this again.");
    process.exit(1);
  }
};

/**
 * Audio paths in video.json are relative to the project folder. Remotion serves
 * files from public/, so mirror them to public/projects/<name>/ and rewrite.
 */
export const stageAssets = (project, spec) => {
  const out = structuredClone(spec);
  const stage = (rel) => {
    const src = path.join(project.dir, rel);
    if (!fs.existsSync(src)) throw new Error(`File not found: ${src}`);
    const pubRel = `projects/${project.name}/${rel.replace(/\\/g, "/")}`;
    const dst = path.join(ROOT, "public", pubRel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    return pubRel;
  };
  if (out.voiceover) out.voiceover = stage(out.voiceover);
  if (out.music?.file) out.music.file = stage(out.music.file);
  for (const s of out.scenes) {
    for (const img of s.images ?? []) if (img.src) img.src = stage(img.src);
    if (s.voice) s.voice = stage(s.voice);
  }
  return out;
};

export const bundleOnce = async () => {
  const { bundle } = await import("@remotion/bundler");
  return bundle({ entryPoint: path.join(ROOT, "src/index.ts"), publicDir: path.join(ROOT, "public") });
};

export const sceneStarts = (spec) => {
  const starts = [];
  let t = 0;
  for (const s of spec.scenes) {
    starts.push(t);
    t += s.duration;
  }
  return { starts, total: t };
};
