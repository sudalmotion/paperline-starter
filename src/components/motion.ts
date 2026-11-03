import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CSSProperties } from "react";

// Vertical videos are watched on a phone held close: everything is drawn 30% larger,
// and wide scenes switch to stacked layouts (see useVertical() call sites).
const VERTICAL_SCALE = 1.3;

/** 1 unit = 1px on the short side of a 1080p frame (×1.3 in vertical). */
export const useUnit = () => {
  const { width, height } = useVideoConfig();
  return (Math.min(width, height) / 1080) * (height > width ? VERTICAL_SCALE : 1);
};

/** Usable content width in px (frame minus the side padding of <Center>). */
export const useContentWidth = () => {
  const { width } = useVideoConfig();
  return width * 0.86;
};

export const useVertical = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

/** 0 → 1 spring that starts `delay` seconds into the scene. */
export const useEnter = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay * fps, fps, config: { damping, mass: 0.8 } });
};

/** Linear 0 → 1 over `length` seconds, starting at `delay`. */
export const useProgress = (delay: number, length: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(frame, [delay * fps, (delay + length) * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
};

/** Paper card dropping onto the desk: rises, settles with a tiny tilt. */
export const dropIn = (p: number, tilt = 0): CSSProperties => ({
  opacity: Math.min(1, p * 1.6),
  transform: `translateY(${(1 - p) * 60}px) rotate(${tilt * (1.6 - p * 0.6)}deg) scale(${0.94 + p * 0.06})`,
});

export const popIn = (p: number): CSSProperties => ({
  opacity: Math.min(1, p * 2),
  transform: `scale(${0.6 + p * 0.4})`,
});

/** Deterministic pseudo-random in [0,1) for a given seed. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};
