import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import type { Scene, Transition } from "../schema";

type Sfx = "whoosh" | "page" | "drop" | "pop" | "stamp" | "pen" | "check" | "tick" | "count";
type Cue = { at: number; sfx: Sfx; vol?: number; len?: number };

/**
 * Sound cues for one scene, in seconds from the scene start.
 * The times mirror the animation delays in scenes/*.tsx — keep them in sync when changing a scene.
 */
export const sceneCues = (s: Scene, exit: Transition): Cue[] => {
  const c: Cue[] = [];
  switch (s.type) {
    case "title":
      c.push({ at: 0.05, sfx: "drop", vol: 0.5 });
      if (s.underline) c.push({ at: 0.55, sfx: "pen", len: 0.5, vol: 0.6 });
      break;
    case "chapter":
      c.push({ at: 0, sfx: "drop" }, { at: 0.35, sfx: "pop", vol: 0.7 });
      break;
    case "bigNumber":
      c.push({ at: 0, sfx: "drop", vol: 0.4 }, { at: 0.2, sfx: "count", vol: 0.8 });
      break;
    case "bars":
      c.push({ at: 0, sfx: "drop" });
      s.items.forEach((_, i) => c.push({ at: 0.3 + i * 0.22, sfx: "tick", vol: 0.8 }));
      break;
    case "list": {
      const step = Math.min(0.9, (s.duration - 1) / Math.max(1, s.items.length));
      c.push({ at: 0, sfx: "drop" });
      s.items.forEach((_, i) => c.push({ at: 0.55 + i * step, sfx: (s.style ?? "check") === "number" ? "pop" : "check", vol: 0.7 }));
      break;
    }
    case "quote":
      c.push({ at: 0, sfx: "drop" });
      break;
    case "progress":
      c.push({ at: 0, sfx: "drop", vol: 0.4 }, { at: 0.3, sfx: "count", vol: 0.8 });
      break;
    case "timeline": {
      const step = Math.max(0.35, (s.duration - 1.2) / Math.max(1, s.events.length));
      c.push({ at: 0.2, sfx: "pen", len: Math.min(1, step * s.events.length), vol: 0.5 });
      s.events.forEach((_, i) => c.push({ at: 0.3 + i * step, sfx: "pop", vol: 0.6 }));
      break;
    }
    case "line":
      c.push({ at: 0, sfx: "drop" }, { at: 0.4, sfx: "pen", len: 1, vol: 0.6 }, { at: 2.0, sfx: "pop", vol: 0.6 });
      break;
    case "document":
      c.push({ at: 0, sfx: "drop" });
      if (s.options && s.checked !== undefined) c.push({ at: 0.7, sfx: "check", vol: 0.7 });
      if (s.stamp) c.push({ at: 1.1, sfx: "stamp" });
      break;
    case "versus":
      c.push({ at: 0, sfx: "drop" }, { at: 0.25, sfx: "drop", vol: 0.7 }, { at: 0.5, sfx: "pop" });
      break;
    case "figure":
      if (s.bubble || s.sign) c.push({ at: 0.45, sfx: "pop" });
      break;
    case "photo":
      s.images.slice(0, 3).forEach((_, i) => c.push({ at: 0.1 + i * 0.35, sfx: "drop" }));
      if (s.tag) c.push({ at: 0.9, sfx: "stamp", vol: 0.6 });
      break;
    case "map":
      c.push({ at: 0, sfx: "drop", vol: 0.5 });
      if (s.route && s.route.length > 1) c.push({ at: 0.6, sfx: "pen", len: Math.min(1, s.duration * 0.45), vol: 0.5 });
      (s.pins ?? []).forEach((_, i) => c.push({ at: 0.5 + i * 0.35, sfx: "pop", vol: 0.7 }));
      break;
  }
  if (exit === "slide") c.push({ at: s.duration - 0.3, sfx: "whoosh", vol: 0.45 });
  if (exit === "page") c.push({ at: s.duration - 0.35, sfx: "page", vol: 0.7 });
  return c.filter((x) => x.at >= 0 && x.at < s.duration);
};

/** Plays a scene's cues. Rendered inside the scene's <Sequence>, so times are scene-relative. */
export const SceneSfx: React.FC<{ scene: Scene; exit: Transition; volume: number }> = ({ scene, exit, volume }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {sceneCues(scene, exit).map((cue, i) => (
        <Sequence key={i} from={Math.round(cue.at * fps)} durationInFrames={cue.len ? Math.max(1, Math.round(cue.len * fps)) : undefined} layout="none">
          <Audio src={staticFile(`sfx/${cue.sfx}.wav`)} volume={volume * (cue.vol ?? 1)} />
        </Sequence>
      ))}
    </>
  );
};
