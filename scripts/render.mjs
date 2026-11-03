// Usage: npm run render -- demo   → projects/demo/out/video.mp4
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { bundleOnce, readSpec, resolveProject, stageAssets, validateOrExit } from "./lib.mjs";

const project = resolveProject(process.argv[2]);
validateOrExit(project.file);
const spec = stageAssets(project, readSpec(project.file));
const outDir = path.join(project.dir, "out");
fs.mkdirSync(outDir, { recursive: true });
const output = path.join(outDir, "video.mp4");

const serveUrl = await bundleOnce();
const composition = await selectComposition({ serveUrl, id: "Paperline", inputProps: spec });
let last = -1;
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  inputProps: spec,
  outputLocation: output,
  onProgress: ({ progress }) => {
    const pct = Math.floor(progress * 10) * 10;
    if (pct !== last) {
      last = pct;
      process.stdout.write(`${pct}% `);
    }
  },
});
console.log(`\n✓ ${output}  (${(composition.durationInFrames / composition.fps).toFixed(1)}s, ${composition.width}×${composition.height})`);

// Loudness: bring the mix to -14 LUFS (YouTube/Instagram playback level). Needs ffmpeg; skipped if missing.
const ffmpeg = process.env.PAPERLINE_FFMPEG || "ffmpeg";
try {
  const tmp = output.replace(/\.mp4$/, ".tmp.mp4");
  execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-i", output, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", tmp]);
  fs.renameSync(tmp, output);
  console.log("✓ audio normalised to -14 LUFS");
} catch (e) {
  fs.rmSync(output.replace(/\.mp4$/, ".tmp.mp4"), { force: true });
  if (e.code === "ENOENT") console.log("(ffmpeg not found — audio left at its rendered level; install ffmpeg for -14 LUFS normalisation)");
  // e.g. a silent video (no narration, sfxVolume 0) has no audio track to normalise.
  else console.log(`(loudness normalisation skipped — the video is fine: ${String(e.stderr ?? e.message).trim().split("\n")[0]})`);
}
