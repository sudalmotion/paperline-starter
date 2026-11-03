// Usage: npm run studio -- my-video   (live preview of projects/my-video in the browser)
// Without a name it opens the demo. Restart it after editing video.json or adding images.
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { ROOT, readSpec, resolveProject, stageAssets } from "./lib.mjs";

const project = resolveProject(process.argv[2] ?? "demo");
// Images and audio are served from public/, so stage them like still/render do.
const spec = stageAssets(project, readSpec(project.file));
const props = path.join(project.dir, "out", "studio-props.json");
fs.mkdirSync(path.dirname(props), { recursive: true });
fs.writeFileSync(props, JSON.stringify(spec));

console.log(`Opening ${project.name} in Remotion Studio…`);
const cli = path.join(ROOT, "node_modules", "@remotion", "cli", "remotion-cli.js");
const child = spawn(process.execPath, [cli, "studio", "src/index.ts", `--props=${props}`], { cwd: ROOT, stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
