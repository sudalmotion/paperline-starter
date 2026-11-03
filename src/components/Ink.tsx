import { color } from "../theme";
import { useProgress, useUnit } from "./motion";

/**
 * Hand-drawn stroke that draws itself. `pathLength=1` lets us animate any path
 * with a 0..1 dash offset without measuring it.
 */
export const DrawPath: React.FC<{
  d: string;
  delay?: number;
  length?: number;
  stroke?: string;
  width?: number;
}> = ({ d, delay = 0, length = 0.6, stroke = color.ink, width = 6 }) => {
  const p = useProgress(delay, length);
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={1}
      strokeDashoffset={1 - p}
    />
  );
};

/** Wobbly marker underline sized to its parent. */
export const Underline: React.FC<{ delay?: number; stroke?: string }> = ({ delay = 0.4, stroke = color.mustard }) => {
  const u = useUnit();
  return (
    <svg
      viewBox="0 0 400 30"
      preserveAspectRatio="none"
      style={{ position: "absolute", left: "-3%", bottom: -14 * u, width: "106%", height: 26 * u, overflow: "visible" }}
    >
      <DrawPath d="M4 18 C 80 8, 160 24, 240 14 S 360 10, 396 16" delay={delay} length={0.5} stroke={stroke} width={10} />
    </svg>
  );
};

/** Hand-drawn circle around content. */
export const Circled: React.FC<{ delay?: number; stroke?: string }> = ({ delay = 0.5, stroke = color.red }) => (
  <svg
    viewBox="0 0 200 100"
    preserveAspectRatio="none"
    style={{ position: "absolute", inset: "-22% -12%", width: "124%", height: "144%", overflow: "visible" }}
  >
    <DrawPath d="M150 12 C 70 0, 6 22, 10 52 C 14 86, 120 98, 176 78 C 206 64, 196 22, 120 10" delay={delay} length={0.7} stroke={stroke} width={4} />
  </svg>
);
