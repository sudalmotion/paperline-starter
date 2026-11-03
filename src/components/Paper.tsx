import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { CSSProperties, ReactNode } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { Stage } from "../schema";
import { color } from "../theme";
import { countries } from "./geo";
import { useUnit } from "./motion";

/** Faint world map printed on the desk (stage: "map"). */
const MapStage: React.FC = () => {
  const { width, height } = useVideoConfig();
  const path = geoPath(geoNaturalEarth1().fitExtent([[-width * 0.05, height * 0.05], [width * 1.05, height * 0.95]], { type: "Sphere" } as never));
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: 0.16 }}>
      {countries.features.map((f, i) => (
        <path key={i} d={path(f) ?? ""} fill="none" stroke={color.ink} strokeWidth={1} />
      ))}
    </svg>
  );
};

/** Desk background: warm paper, fibre grain and a soft vignette, drifting very slowly. */
export const PaperBackground: React.FC<{ stage?: Stage }> = ({ stage = "paper" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // Parallax: the desk moves much slower than the scene camera.
  const drift = `scale(1.06) translate(${Math.sin(t * 0.07) * 1.2}%, ${Math.cos(t * 0.05) * 0.8}%)`;
  return (
  <AbsoluteFill style={{ backgroundColor: color.paper, overflow: "hidden" }}>
    <AbsoluteFill style={{ transform: drift }}>
      {stage === "grid" && (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${color.rule} 1px, transparent 1px), linear-gradient(90deg, ${color.rule} 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            opacity: 0.8,
          }}
        />
      )}
      {stage === "map" && <MapStage />}
    </AbsoluteFill>
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7" />
        <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0 0.12  0 0 0 0.22 0" />
      </filter>
      <filter id="fibre">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.18" numOctaves="2" seed="3" />
        <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.24  0 0 0 0 0.14  0 0 0 0.09 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#fibre)" />
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 45%, rgba(255,250,238,0.55) 0%, rgba(0,0,0,0) 55%, rgba(60,45,25,0.18) 100%)",
      }}
    />
  </AbsoluteFill>
  );
};

/** A sheet of paper lying on the desk. */
export const Card: React.FC<{ children: ReactNode; style?: CSSProperties; tilt?: number }> = ({
  children,
  style,
  tilt = 0,
}) => {
  const u = useUnit();
  return (
    <div
      style={{
        background: color.card,
        borderRadius: 6 * u,
        padding: 48 * u,
        boxShadow: `0 ${2 * u}px 0 ${color.paperDeep}, 0 ${18 * u}px ${36 * u}px rgba(60,40,15,0.18)`,
        transform: `rotate(${tilt}deg)`,
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Center: React.FC<{ children: ReactNode; gap?: number; style?: CSSProperties }> = ({
  children,
  gap = 0,
  style,
}) => {
  const { width, height } = useVideoConfig();
  // Vertical: keep clear of the top bar and the caption + app-UI zone at the bottom.
  // Top 11.5% leaves room for the date badge; bottom 30% holds captions + the source note.
  const padding = height > width ? `${height * 0.115}px ${width * 0.07}px ${height * 0.3}px` : "8% 7% 16%";
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap,
        padding,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
