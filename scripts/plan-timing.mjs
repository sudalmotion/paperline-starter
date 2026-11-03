// Usage: npm run plan -- demo [--wps 2.6] [--write]
// Sets each scene's duration from its narration (`say`) length. Without --write it only prints.
import fs from "node:fs";
import { MIN_SCENE, readSpec, resolveProject } from "./lib.mjs";

const args = process.argv.slice(2);
const project = resolveProject(args[0]);
const wpsArg = args.indexOf("--wps");
const wps = wpsArg > -1 ? Number(args[wpsArg + 1]) : 2.6;
const write = args.includes("--write");
const spec = readSpec(project.file);
const MIN = MIN_SCENE;

let total = 0;
for (const [i, s] of spec.scenes.entries()) {
  // Scenes with generated narration are already fitted to the real voice by `npm run voice`.
  if (s.voice && s.voiceLength) {
    console.log(`${String(i + 1).padStart(2)}. ${s.type.padEnd(10)} has narration → keeps ${s.duration}s`);
    total += s.duration;
    continue;
  }
  const words = (s.say ?? "").split(/\s+/).filter(Boolean).length;
  const fromVoice = words ? words / wps + 0.6 : 0;
  const d = Math.round(Math.max(MIN[s.type] ?? 3, fromVoice) * 10) / 10;
  console.log(`${String(i + 1).padStart(2)}. ${s.type.padEnd(10)} ${String(words).padStart(3)} words → ${d}s${s.duration && s.duration !== d ? `  (was ${s.duration}s)` : ""}`);
  s.duration = d;
  total += d;
}
console.log(`Total ${total.toFixed(1)}s (${(total / 60).toFixed(1)} min) at ${wps} words/sec`);
if (write) {
  fs.writeFileSync(project.file, JSON.stringify(spec, null, 2) + "\n");
  console.log(`✓ wrote ${project.file}`);
} else console.log("(dry run — add --write to save)");
