import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { VOICE_LEAD } from "./schema";
import type { Camera, Scene, Transition, VideoSpec } from "./schema";
import { PaperBackground } from "./components/Paper";
import { autoCaptions, Badge, Captions, SourceNote } from "./components/Overlays";
import { SCENES } from "./scenes/registry";
import { SceneSfx } from "./components/sfx";
import { Card, Center } from "./components/Paper";
import { color, fonts } from "./theme";

/** Shown when a video uses a scene type this edition doesn't include. */
const MissingScene: React.FC<{ type: string }> = ({ type }) => (
  <Center>
    <Card style={{ textAlign: "center" }}>
      <div style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: 28, color: color.red, letterSpacing: 3 }}>SCENE "{type.toUpperCase()}"</div>
      <div style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 40, color: color.ink, marginTop: 14 }}>is included in the full Paperline kit</div>
    </Card>
  </Center>
);

const SceneBody: React.FC<{ scene: Scene }> = ({ scene }) => {
  const Component = SCENES[scene.type];
  return Component ? <Component {...scene} /> : <MissingScene type={scene.type} />;
};

/** Slow camera move across the whole scene, so nothing ever sits perfectly still. */
const cameraTransform = (camera: Camera, k: number) => {
  switch (camera) {
    case "still":
      return "none";
    case "push":
      return `scale(${1 + 0.08 * k})`;
    case "pull":
      return `scale(${1.08 - 0.08 * k})`;
    case "pan-left":
      return `scale(1.06) translateX(${2 - 4 * k}%)`;
    case "pan-right":
      return `scale(1.06) translateX(${-2 + 4 * k}%)`;
    default:
      return `scale(${1 + 0.035 * k}) translate(${0.6 * k}%, ${-0.4 * k}%)`;
  }
};

/** Full-frame sheet of paper used by the "page" transition. */
const PageSheet: React.FC<{ x: number }> = ({ x }) => (
  <AbsoluteFill style={{ transform: `translateX(${x}%) rotate(${x * 0.02}deg)`, background: color.paperDeep, boxShadow: "-30px 0 60px rgba(60,40,15,.35)" }} />
);

/** Wraps every scene: camera, corner overlays and the exit transition. */
const SceneFrame: React.FC<{ scene: Scene; frames: number; exit: Transition; enterPage: boolean }> = ({ scene, frames, exit, enterPage }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = (exit === "page" ? 0.35 : 0.3) * fps;
  const out = interpolate(frame, [frames - len, frames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const k = interpolate(frame, [0, frames], [0, 1], { extrapolateRight: "clamp" });
  const exitStyle =
    exit === "fade"
      ? { opacity: 1 - out }
      : exit === "slide"
        ? { opacity: 1 - out, transform: `translateX(${-out * 8}%) rotate(${-out * 2}deg)` }
        : {};
  const pageIn = enterPage ? interpolate(frame, [0, 0.35 * fps], [0, -110], { extrapolateRight: "clamp" }) : null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={exitStyle}>
        <AbsoluteFill style={{ transform: cameraTransform(scene.camera ?? "drift", k) }}>
          <SceneBody scene={scene} />
        </AbsoluteFill>
        {scene.badge && <Badge text={scene.badge} />}
        {scene.source && <SourceNote text={scene.source} />}
      </AbsoluteFill>
      {exit === "page" && out > 0 && <PageSheet x={110 - out * 110} />}
      {pageIn !== null && pageIn > -110 && <PageSheet x={pageIn} />}
    </AbsoluteFill>
  );
};

export const PaperlineVideo: React.FC<VideoSpec> = (spec) => {
  const { fps } = useVideoConfig();
  let from = 0;
  const starts: number[] = [];
  spec.scenes.reduce((t, s) => (starts.push(t), t + Math.max(1, Math.round(s.duration * fps)) / fps), 0);
  // Captions: an imported .srt wins; otherwise word-timed cues from `npm run voice`, else narration split evenly.
  const captions =
    spec.captions ??
    spec.scenes.flatMap((s, i) =>
      s.voiceCues
        ? s.voiceCues.map((c) => ({ start: starts[i]! + VOICE_LEAD + c.start, end: Math.min(starts[i]! + s.duration, starts[i]! + VOICE_LEAD + c.end), text: c.text }))
        : autoCaptions([s]).map((c) => ({ ...c, start: c.start + starts[i]!, end: c.end + starts[i]! })),
    );
  const exitOf = (s: Scene | undefined): Transition => s?.transition ?? spec.meta.transition ?? "slide";
  const hasVoice = !!spec.voiceover || spec.scenes.some((s) => s.voice);
  // Effects sit under the voice; lower them further when there is narration.
  const sfxVolume = spec.meta.sfxVolume ?? (hasVoice ? 0.4 : 0.6);
  return (
    <AbsoluteFill>
      <PaperBackground stage={spec.meta.stage ?? "paper"} />
      {spec.scenes.map((scene, i) => {
        const frames = Math.max(1, Math.round(scene.duration * fps));
        const start = from;
        from += frames;
        const last = i === spec.scenes.length - 1;
        return (
          <Sequence key={i} from={start} durationInFrames={frames} name={`${i + 1}. ${scene.type}`}>
            <SceneFrame scene={scene} frames={frames} exit={last ? "fade" : exitOf(scene)} enterPage={i > 0 && exitOf(spec.scenes[i - 1]) === "page"} />
            {sfxVolume > 0 && scene.sfx !== false && <SceneSfx scene={scene} exit={last ? "fade" : exitOf(scene)} volume={sfxVolume} />}
            {scene.voice && (
              <Sequence from={Math.round(VOICE_LEAD * fps)} layout="none">
                <Audio src={staticFile(scene.voice)} />
              </Sequence>
            )}
          </Sequence>
        );
      })}
      {spec.meta.captions !== false && <Captions captions={captions} />}
      {spec.voiceover && <Audio src={staticFile(spec.voiceover)} />}
      {spec.music && <Audio src={staticFile(spec.music.file)} volume={spec.music.volume ?? 0.12} loop />}
    </AbsoluteFill>
  );
};

export const totalFrames = (spec: VideoSpec, fps: number) =>
  spec.scenes.reduce((n, s) => n + Math.max(1, Math.round(s.duration * fps)), 0);
