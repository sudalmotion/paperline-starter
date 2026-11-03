// Usage: npm run validate -- demo
// Checks video.json before rendering. Errors stop the render; warnings are advice.
import fs from "node:fs";
import path from "node:path";
import { ROOT, readSpec, resolveProject } from "./lib.mjs";

const edition = JSON.parse(fs.readFileSync(path.join(ROOT, "scenes.json"), "utf8"));

const project = resolveProject(process.argv[2]);
const spec = readSpec(project.file);
const errors = [];
const warns = [];

const REQUIRED = {
  title: ["title"],
  chapter: ["number", "title"],
  bigNumber: ["value", "label"],
  bars: ["items"],
  progress: ["value", "total", "label"],
  document: ["heading"],
  versus: ["left", "right"],
  figure: ["pose"],
  timeline: ["events"],
  list: ["title", "items"],
  quote: ["quote"],
  line: ["points"],
  photo: ["images"],
  map: [],
};
const CAMERAS = ["drift", "still", "push", "pull", "pan-left", "pan-right"];
const TRANSITIONS = ["slide", "page", "fade"];
const ACCENTS = ["mustard", "red", "teal", "ink"];

// Country names known to the map scene (Natural Earth via world-atlas).
let countryNames = null;
const loadCountries = () => {
  if (!countryNames) {
    const file = path.join(ROOT, "node_modules/world-atlas/countries-50m.json");
    if (!fs.existsSync(file)) {
      console.log("✗ Map data not installed — run `npm install` in the kit folder first.");
      process.exit(1);
    }
    const topo = JSON.parse(fs.readFileSync(file, "utf8"));
    countryNames = topo.objects.countries.geometries.map((g) => g.properties.name);
  }
  return countryNames;
};
const POSES = ["stand", "point", "think", "shrug", "cheer", "worried"];
// Longest text that still fits the layout at the default size.
const MAX_CHARS = { title: 60, chapterTitle: 34, label: 70, quote: 140, item: 42, sign: 28, bubble: 40 };
const WPS = 2.6; // comfortable narration speed (~155 words per minute)

if (!spec.meta?.title) errors.push("meta.title is missing");
if (!Array.isArray(spec.scenes) || !spec.scenes.length) errors.push("scenes must be a non-empty array");
const metaOneOf = (field, allowed) => spec.meta?.[field] !== undefined && !allowed.includes(spec.meta[field]) && errors.push(`meta.${field} "${spec.meta[field]}" — use one of ${allowed.join(", ")}`);
metaOneOf("format", ["landscape", "vertical"]);
metaOneOf("stage", ["paper", "grid", "map"]);
metaOneOf("transition", TRANSITIONS);
if (spec.meta?.sfxVolume !== undefined && !(spec.meta.sfxVolume >= 0 && spec.meta.sfxVolume <= 1)) errors.push("meta.sfxVolume must be between 0 and 1");

let total = 0;
(spec.scenes ?? []).forEach((s, i) => {
  const at = `scene ${i + 1} (${s?.type})`;
  if (typeof s !== "object" || s === null) return errors.push(`scene ${i + 1}: must be an object`);
  if (!REQUIRED[s.type]) return errors.push(`${at}: unknown type. Use one of ${edition.scenes.join(", ")}`);
  if (!edition.scenes.includes(s.type))
    return errors.push(`${at}: "${s.type}" is not included in ${edition.edition} — it's part of the full Paperline kit. Available: ${edition.scenes.join(", ")}`);
  for (const k of REQUIRED[s.type]) if (s[k] === undefined || s[k] === "") errors.push(`${at}: "${k}" is required`);
  if (!(s.duration > 0)) errors.push(`${at}: duration must be > 0 seconds`);
  total += s.duration || 0;

  const long = (field, text, max) => text && text.length > max && warns.push(`${at}: ${field} is ${text.length} chars (max ~${max}) — shorten or it may wrap badly`);
  long("title", s.type === "title" ? s.title : "", MAX_CHARS.title);
  long("title", s.type === "chapter" ? s.title : "", MAX_CHARS.chapterTitle);
  long("label", s.label, MAX_CHARS.label);
  long("quote", s.quote, MAX_CHARS.quote);
  long("sign", s.sign, MAX_CHARS.sign);
  long("bubble", s.bubble, MAX_CHARS.bubble);
  (s.items ?? []).forEach((it, j) => long(`items[${j}]`, typeof it === "string" ? it : it.label, MAX_CHARS.item));

  if (s.type === "bars" && s.items?.length > 7) warns.push(`${at}: ${s.items.length} bars — more than 7 gets crowded`);
  if (s.type === "list" && s.items?.length > 6) warns.push(`${at}: ${s.items.length} items — split into two lists`);
  if (s.type === "timeline" && s.events?.length > 6) warns.push(`${at}: ${s.events.length} events — more than 6 overlaps`);
  if (s.type === "line" && s.points?.length < 2) errors.push(`${at}: line needs at least 2 points`);
  if (s.type === "progress" && s.value > s.total) errors.push(`${at}: value is larger than total`);
  if (s.type === "figure" && ![s.pose, s.pose2].filter(Boolean).every((p) => POSES.includes(p))) errors.push(`${at}: pose must be one of ${POSES.join(", ")}`);
  if (s.type === "document" && s.checked !== undefined && !s.options) warns.push(`${at}: "checked" has no effect without "options"`);
  // Structure: wrong shapes render silently as blank charts or default colours, so catch them here.
  const isNum = (v) => typeof v === "number" && Number.isFinite(v);
  const isText = (v) => typeof v === "string" && v.trim() !== "";
  const oneOf = (field, v, allowed) => v !== undefined && !allowed.includes(v) && errors.push(`${at}: ${field} "${v}" — use one of ${allowed.join(", ")}`);
  oneOf("accent", s.accent, ACCENTS);
  for (const k of ["value", "total", "decimals", "number"]) if (s[k] !== undefined && !isNum(s[k])) errors.push(`${at}: "${k}" must be a number (got ${JSON.stringify(s[k])})`);
  if (s.type === "title" && s.underline && !s.title?.split(" ").some((w) => w.replace(/[^\w]/g, "").toLowerCase() === s.underline.replace(/[^\w]/g, "").toLowerCase()))
    errors.push(`${at}: underline "${s.underline}" is not a word in the title`);
  if (s.type === "bars" && Array.isArray(s.items))
    s.items.forEach((it, j) => (!isText(it?.label) || !isNum(it?.value)) && errors.push(`${at}: items[${j}] needs "label" (text) and "value" (number)`));
  if (s.type === "line" && Array.isArray(s.points))
    s.points.forEach((q, j) => (!isText(q?.x) || !isNum(q?.y)) && errors.push(`${at}: points[${j}] needs "x" (text, e.g. "2020") and "y" (number)`));
  if (s.type === "line" && s.points?.length > 10) warns.push(`${at}: ${s.points.length} points — more than 10 gets crowded`);
  if (s.type === "timeline" && Array.isArray(s.events))
    s.events.forEach((e, j) => (!isText(e?.year) || !isText(e?.label)) && errors.push(`${at}: events[${j}] needs "year" and "label" (both text)`));
  if (s.type === "timeline" && s.events?.some((e) => e?.label?.length > 18)) warns.push(`${at}: timeline labels over 18 chars may touch each other`);
  if (s.type === "list") {
    oneOf("style", s.style, ["check", "number", "cross"]);
    if (Array.isArray(s.items) && !s.items.every(isText)) errors.push(`${at}: list items must be text`);
  }
  if (s.type === "versus")
    for (const side of ["left", "right"])
      if (typeof s[side] !== "object" || !isText(s[side]?.title)) errors.push(`${at}: "${side}" needs { "title": "…" }`);
      else if (s[side].points?.length > 3) warns.push(`${at}: ${side} has ${s[side].points.length} points — keep it to 3`);
  if (s.type === "document") {
    if (s.options !== undefined && (!Array.isArray(s.options) || s.options.length !== 2)) errors.push(`${at}: "options" must be exactly two labels`);
    if (s.checked !== undefined && s.checked !== 0 && s.checked !== 1) errors.push(`${at}: "checked" must be 0 or 1`);
    if (s.stamp?.length > 14) warns.push(`${at}: stamp is ${s.stamp.length} chars (max ~14)`);
  }
  if (s.type === "photo")
    for (const [j, img] of (s.images ?? []).entries()) {
      oneOf(`images[${j}].style`, img.style, ["card", "torn", "cutout"]);
      oneOf(`images[${j}].treatment`, img.treatment, ["color", "mono", "halftone"]);
    }
  if (s.type === "map") {
    oneOf("view", s.view, ["fit", "world"]);
    (s.pins ?? []).forEach((p, j) => (!isNum(p?.lon) || !isNum(p?.lat)) && errors.push(`${at}: pins[${j}] needs numeric "lon" and "lat"`));
    if (s.route && !s.route.every((p) => Array.isArray(p) && p.length === 2 && p.every(isNum))) errors.push(`${at}: route must be a list of [lon, lat] number pairs`);
  }
  if (s.camera && !CAMERAS.includes(s.camera)) errors.push(`${at}: camera must be one of ${CAMERAS.join(", ")}`);
  if (s.transition && !TRANSITIONS.includes(s.transition)) errors.push(`${at}: transition must be one of ${TRANSITIONS.join(", ")}`);

  if (s.type === "photo") {
    if (!s.images?.length) errors.push(`${at}: needs at least one image`);
    if (s.images?.length > 3) warns.push(`${at}: only the first 3 images are shown`);
    for (const [j, img] of (s.images ?? []).entries()) {
      if (!img.src) errors.push(`${at}: images[${j}].src is required`);
      else if (!fs.existsSync(path.join(project.dir, img.src))) errors.push(`${at}: image not found: ${img.src} (paths are relative to the project folder)`);
      else if (img.style === "cutout" && !/\.png$/i.test(img.src)) warns.push(`${at}: cutout works best with a transparent .png (got ${img.src})`);
    }
  }
  if (s.type === "map") {
    const names = loadCountries();
    for (const c of s.highlight ?? []) {
      if (!names.some((n) => n.toLowerCase() === c.toLowerCase())) {
        const near = names.filter((n) => n.toLowerCase().includes(c.toLowerCase().slice(0, 4))).slice(0, 4);
        errors.push(`${at}: unknown country "${c}"${near.length ? ` — did you mean ${near.map((n) => `"${n}"`).join(", ")}?` : ""}`);
      }
    }
    for (const p of [...(s.pins ?? []).map((p) => [p.lon, p.lat]), ...(s.route ?? [])])
      if (!(Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90)) errors.push(`${at}: coordinates must be [lon, lat] within ±180 / ±90 (got ${p})`);
    if (!s.highlight?.length && !s.pins?.length && !s.route?.length && s.view !== "world") warns.push(`${at}: nothing to focus on — add highlight, pins or route, or set "view": "world"`);
  }

  if (s.voice && s.voiceLength) {
    // Generated narration: check the real length (0.25s lead before the voice starts).
    if (s.voiceLength + 0.25 > s.duration) errors.push(`${at}: narration is ${s.voiceLength}s but the scene ends at ${s.duration}s — run \`npm run voice\` again or lengthen the scene`);
  } else if (s.say) {
    const words = s.say.split(/\s+/).filter(Boolean).length;
    const need = words / WPS;
    if (need > s.duration + 0.3) warns.push(`${at}: narration needs ~${need.toFixed(1)}s but scene is ${s.duration}s`);
  }
  if (s.voice && !fs.existsSync(path.join(project.dir, s.voice))) errors.push(`${at}: voice file not found: ${s.voice}`);
  if (s.duration > 12) warns.push(`${at}: ${s.duration}s on one visual — viewers drift after ~8s; consider splitting`);
});

if (spec.captions) {
  spec.captions.forEach((c, i) => {
    if (!(c.end > c.start)) errors.push(`captions[${i}]: end must be after start`);
    if (c.end > total + 0.5) warns.push(`captions[${i}]: ends at ${c.end}s but video is ${total.toFixed(1)}s`);
  });
}

for (const w of warns) console.log(`⚠ ${w}`);
for (const e of errors) console.log(`✗ ${e}`);
console.log(`${errors.length ? "✗" : "✓"} ${project.name}: ${spec.scenes?.length ?? 0} scenes, ${total.toFixed(1)}s, ${errors.length} errors, ${warns.length} warnings`);
process.exit(errors.length ? 1 : 0);
