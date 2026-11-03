// Usage:
//   npm run still -- demo            → one still per scene (at 75%) + out/sheet.jpg
//   npm run still -- demo 2.5 10     → stills at those seconds
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { selectComposition, renderStill } from "@remotion/renderer";
import { bundleOnce, readSpec, resolveProject, sceneStarts, stageAssets, validateOrExit } from "./lib.mjs";

const [arg, ...times] = process.argv.slice(2);
const project = resolveProject(arg);
validateOrExit(project.file);
const spec = stageAssets(project, readSpec(project.file));
const outDir = path.join(project.dir, "out");
fs.mkdirSync(outDir, { recursive: true });

const serveUrl = await bundleOnce();
const composition = await selectComposition({ serveUrl, id: "Paperline", inputProps: spec });
const fps = composition.fps;

const { starts } = sceneStarts(spec);
const shots = times.length
  ? times.map((t) => ({ t: Number(t), name: `still_${t}s.png` }))
  : spec.scenes.map((s, i) => ({ t: starts[i] + s.duration * 0.75, name: `scene_${String(i + 1).padStart(2, "0")}.png` }));

for (const s of shots) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(s.t * fps));
  await renderStill({ composition, serveUrl, inputProps: spec, frame, output: path.join(outDir, s.name) });
  console.log(`✓ ${s.name}  (t=${s.t.toFixed(2)}s)`);
}

if (!times.length) {
  const cols = 4;
  const rows = Math.ceil(shots.length / cols);
  try {
    execFileSync(process.env.PAPERLINE_FFMPEG || "ffmpeg", [
      "-y", "-loglevel", "error", "-i", path.join(outDir, "scene_%02d.png"),
      "-vf", `scale=480:-1,tile=${cols}x${rows}:padding=6:color=white`, "-frames:v", "1", path.join(outDir, "sheet.jpg"),
    ]);
    console.log(`✓ sheet.jpg → ${path.join(outDir, "sheet.jpg")}`);
  } catch {
    console.log("(ffmpeg not found — skipped sheet.jpg; individual stills are in out/)");
  }
}
