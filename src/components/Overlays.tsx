import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Caption } from "../schema";
import { color, fonts } from "../theme";
import { useEnter, useUnit, useVertical } from "./motion";
import { chunkWords } from "./captionChunks";

/** Vertical: captions sit just above the app UI; the source note goes in the gap below them. */
const CAPTION_BOTTOM_VERTICAL = 0.235;
const SOURCE_BOTTOM_VERTICAL = 0.215;

export const Captions: React.FC<{ captions: Caption[] }> = ({ captions }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = useUnit();
  const vertical = useVertical();
  const t = frame / fps;
  const cue = captions.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  // Reels/Shorts UI covers the bottom ~22% of a vertical video. Padding is in px:
  // a % padding would be measured against the width, not the height.
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: vertical ? height * CAPTION_BOTTOM_VERTICAL : width * 0.055 }}>
      <div
        style={
          {
            maxWidth: vertical ? "88%" : "78%",
            background: "rgba(42,37,31,0.88)",
            color: color.card,
            fontFamily: fonts.sans,
            fontWeight: 500,
            fontSize: 38 * u,
            lineHeight: 1.3,
            padding: `${10 * u}px ${22 * u}px`,
            borderRadius: 6 * u,
            textAlign: "center",
            // 두 줄로 넘어갈 때 한 단어만 아랫줄에 남지 않도록 줄 길이를 고르게 맞춘다.
            textWrap: "balance",
          } as React.CSSProperties
        }
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};

/** Safe top edge for corner overlays: below the app's top bar in vertical videos. */
const useTopInset = () => {
  const { height } = useVideoConfig();
  const u = useUnit();
  return useVertical() ? height * 0.07 : 44 * u;
};

export const SourceNote: React.FC<{ text: string }> = ({ text }) => {
  const u = useUnit();
  const vertical = useVertical();
  const { height } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: 48 * u,
        // Vertical: the bottom corner is under the app UI, so lift the note above it.
        bottom: vertical ? height * SOURCE_BOTTOM_VERTICAL : 34 * u,
        fontFamily: fonts.mono,
        fontWeight: 500,
        fontSize: 18 * u,
        letterSpacing: 1,
        color: color.inkSoft,
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );
};

export const Badge: React.FC<{ text: string }> = ({ text }) => {
  const u = useUnit();
  const p = useEnter(0.1);
  const top = useTopInset();
  return (
    <div
      style={{
        position: "absolute",
        left: 48 * u,
        top,
        background: color.ink,
        color: color.card,
        fontFamily: fonts.mono,
        fontWeight: 600,
        fontSize: 30 * u,
        padding: `${6 * u}px ${18 * u}px`,
        borderRadius: 4 * u,
        transform: `translateX(${(1 - p) * -40 * u}px) rotate(-2deg)`,
        opacity: p,
      }}
    >
      {text}
    </div>
  );
};

/** Split narration into caption cues of at most `maxWords`, spread over the scene. */
export const autoCaptions = (scenes: { duration: number; say?: string }[], maxWords = 7): Caption[] => {
  const out: Caption[] = [];
  let at = 0;
  for (const s of scenes) {
    const words = (s.say ?? "").split(/\s+/).filter(Boolean);
    if (words.length) {
      // Break at sentence ends and natural pauses; time each chunk by its length (no voice to align to).
      const chunks = chunkWords(words, (w) => w, maxWords).map((c) => c.join(" "));
      const total = chunks.reduce((n, c) => n + c.length + 6, 0);
      let t = at;
      for (const c of chunks) {
        const len = (s.duration * (c.length + 6)) / total;
        out.push({ start: t, end: t + len, text: c });
        t += len;
      }
    }
    at += s.duration;
  }
  return out;
};
