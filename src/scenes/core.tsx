import type { BarsScene, BigNumberScene, ChapterScene, ListScene, QuoteScene, TitleScene } from "../schema";
import { accentColor, color, fonts } from "../theme";
import { Card, Center } from "../components/Paper";
import { DrawPath, Underline } from "../components/Ink";
import { fmt } from "../components/format";
import { dropIn, popIn, useContentWidth, useEnter, useProgress, useUnit, useVertical } from "../components/motion";

// Core scenes — included in both Paperline Starter (free) and Paperline.
export const Title: React.FC<TitleScene> = ({ kicker, title, underline, accent }) => {
  const u = useUnit();
  const pk = useEnter(0);
  const pt = useEnter(0.15);
  const words = title.split(" ");
  const clean = (w: string) => w.replace(/[^\w]/g, "").toLowerCase();
  // Underline only the first matching word, even if it appears twice.
  const underlineAt = underline ? words.findIndex((w) => clean(w) === clean(underline)) : -1;
  return (
    <Center gap={28 * u}>
      {kicker && (
        <div style={{ ...dropIn(pk), fontFamily: fonts.mono, fontWeight: 600, fontSize: 30 * u, letterSpacing: 4 * u, lineHeight: 1.4, color: accentColor(accent), textTransform: "uppercase", textAlign: "center" }}>
          {kicker}
        </div>
      )}
      <div style={{ ...dropIn(pt), fontFamily: fonts.serif, fontWeight: 800, fontSize: 104 * u, lineHeight: 1.05, color: color.ink, textAlign: "center", maxWidth: 1500 * u }}>
        {words.map((w, i) => (
          <span key={i} style={{ position: "relative", display: "inline-block", marginRight: "0.25em" }}>
            {w}
            {i === underlineAt && <Underline delay={0.55} stroke={accentColor(accent)} />}
          </span>
        ))}
      </div>
    </Center>
  );
};

export const Chapter: React.FC<ChapterScene> = ({ number, title }) => {
  const u = useUnit();
  const vertical = useVertical();
  const p = useEnter(0);
  const s = useEnter(0.35, 9);
  return (
    <Center>
      <Card
        tilt={-1.5}
        style={{
          ...dropIn(p, -3),
          padding: vertical ? `${50 * u}px ${50 * u}px` : `${56 * u}px ${90 * u}px`,
          display: "flex",
          flexDirection: vertical ? "column" : "row",
          alignItems: vertical ? "flex-start" : "center",
          gap: (vertical ? 28 : 48) * u,
          maxWidth: "100%",
        }}
      >
        <div style={{ ...popIn(s), width: 150 * u, height: 150 * u, borderRadius: "50%", border: `${7 * u}px solid ${color.red}`, color: color.red, fontFamily: fonts.serif, fontWeight: 800, fontSize: 84 * u, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {number}
        </div>
        <div>
          <div style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: 26 * u, letterSpacing: 6 * u, color: color.inkSoft }}>CHAPTER {number}</div>
          <div style={{ fontFamily: fonts.serif, fontWeight: 800, fontSize: 72 * u, color: color.ink, lineHeight: 1.05, maxWidth: vertical ? undefined : 1000 * u }}>{title}</div>
        </div>
      </Card>
    </Center>
  );
};

const Mark: React.FC<{ kind: "check" | "number" | "cross"; n: number; delay: number; size: number }> = ({ kind, n, delay, size }) => {
  if (kind === "number")
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", background: color.ink, color: color.card, fontFamily: fonts.mono, fontWeight: 600, fontSize: size * 0.5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {n}
      </div>
    );
  return (
    <svg viewBox="0 0 40 40" style={{ width: size, height: size, flexShrink: 0, overflow: "visible" }}>
      <rect x={3} y={3} width={34} height={34} rx={4} fill="none" stroke={color.ink} strokeWidth={3} />
      {kind === "check" ? (
        <DrawPath d="M9 21 L17 29 L33 9" delay={delay} length={0.3} stroke={color.teal} width={5} />
      ) : (
        <>
          <DrawPath d="M10 10 L30 30" delay={delay} length={0.2} stroke={color.red} width={5} />
          <DrawPath d="M30 10 L10 30" delay={delay + 0.15} length={0.2} stroke={color.red} width={5} />
        </>
      )}
    </svg>
  );
};

export const List: React.FC<ListScene & { duration: number }> = ({ title, items, style = "check", duration }) => {
  const u = useUnit();
  const vertical = useVertical();
  const pt = useEnter(0);
  const step = Math.min(0.9, (duration - 1) / Math.max(1, items.length));
  return (
    <Center>
      <Card tilt={0.8} style={{ ...dropIn(pt, 2), minWidth: vertical ? "100%" : 900 * u, maxWidth: vertical ? "100%" : 1300 * u, boxSizing: "border-box" }}>
        <div style={{ fontFamily: fonts.serif, fontWeight: 800, fontSize: 60 * u, color: color.ink, marginBottom: 30 * u }}>{title}</div>
        {items.map((it, i) => (
          <ListRow key={i} delay={0.4 + i * step}>
            <Mark kind={style} n={i + 1} delay={0.55 + i * step} size={46 * u} />
            <span style={{ fontFamily: fonts.sans, fontWeight: 500, fontSize: 40 * u, color: color.ink }}>{it}</span>
          </ListRow>
        ))}
      </Card>
    </Center>
  );
};

const ListRow: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => {
  const u = useUnit();
  const p = useEnter(delay);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 * u, padding: `${14 * u}px 0`, borderTop: `${2 * u}px dashed ${color.rule}`, opacity: p, transform: `translateX(${(1 - p) * 30 * u}px)` }}>
      {children}
    </div>
  );
};

export const Quote: React.FC<QuoteScene> = ({ quote, author }) => {
  const u = useUnit();
  const p = useEnter(0);
  const pa = useEnter(0.6);
  return (
    <Center>
      <Card tilt={-1} style={{ ...dropIn(p, -2), maxWidth: "min(100%, " + 1350 * u + "px)", boxSizing: "border-box", padding: `${70 * u}px ${70 * u}px` }}>
        <div style={{ position: "absolute", left: 30 * u, top: -40 * u, fontFamily: fonts.serif, fontWeight: 800, fontSize: 200 * u, color: color.mustard, lineHeight: 1 }}>“</div>
        <div style={{ fontFamily: fonts.serif, fontWeight: 600, fontSize: 58 * u, lineHeight: 1.25, color: color.ink }}>{quote}</div>
        {author && (
          <div style={{ marginTop: 36 * u, fontFamily: fonts.mono, fontWeight: 600, fontSize: 26 * u, letterSpacing: 3 * u, color: color.inkSoft, opacity: pa }}>— {author.toUpperCase()}</div>
        )}
      </Card>
    </Center>
  );
};

export const BigNumber: React.FC<BigNumberScene> = ({ value, prefix = "", suffix = "", decimals = 0, label, accent }) => {
  const u = useUnit();
  const maxWidth = useContentWidth();
  const p = useEnter(0);
  const count = useProgress(0.2, 1.2);
  const pl = useEnter(0.5);
  // Shrink long figures (e.g. "$11,263,704") so the final value always fits.
  const chars = (prefix + fmt(value, decimals) + suffix).length;
  const size = Math.min(230 * u, maxWidth / (chars * 0.62));
  return (
    <Center gap={10 * u}>
      <div style={{ ...dropIn(p), fontFamily: fonts.serif, fontWeight: 800, fontSize: size, lineHeight: 1, color: accentColor(accent ?? "red"), fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
        {prefix}
        {fmt(value * count, decimals)}
        {suffix}
      </div>
      <div style={{ opacity: pl, fontFamily: fonts.sans, fontWeight: 700, fontSize: 46 * u, color: color.ink, textAlign: "center", maxWidth: 1300 * u }}>{label}</div>
    </Center>
  );
};

const BarRow: React.FC<{ label: string; value: number; max: number; prefix?: string; unit?: string; highlight?: boolean; delay: number }> = ({
  label,
  value,
  max,
  prefix,
  unit,
  highlight,
  delay,
}) => {
  const u = useUnit();
  const vertical = useVertical();
  const g = useProgress(delay, 0.9);
  const fill = highlight ? color.red : color.inkSoft;
  const valueText = (
    <div style={{ width: vertical ? undefined : 200 * u, fontFamily: fonts.mono, fontWeight: 600, fontSize: 32 * u, color: highlight ? color.red : color.ink }}>
      {prefix ?? ""}
      {fmt(value * g, Math.min(2, (String(value).split(".")[1] ?? "").length))}
      {unit ?? ""}
    </div>
  );
  const labelStyle = { fontFamily: fonts.sans, fontWeight: 700, fontSize: 34 * u, color: color.ink };
  const bar = (
    <div style={{ flex: 1, height: (vertical ? 44 : 54) * u, background: color.rule, borderRadius: 4 * u }}>
      <div style={{ width: `${(value / max) * 100 * g}%`, height: "100%", background: fill, borderRadius: 4 * u }} />
    </div>
  );
  // Vertical: label + value on one line, full-width bar below.
  if (vertical)
    return (
      <div style={{ opacity: Math.min(1, g * 4) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 * u }}>
          <span style={labelStyle}>{label}</span>
          {valueText}
        </div>
        <div style={{ display: "flex" }}>{bar}</div>
      </div>
    );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 * u, opacity: Math.min(1, g * 4) }}>
      <div style={{ ...labelStyle, width: 300 * u, textAlign: "right" }}>{label}</div>
      {bar}
      {valueText}
    </div>
  );
};

export const Bars: React.FC<BarsScene> = ({ title, prefix, unit, items }) => {
  const u = useUnit();
  const vertical = useVertical();
  const p = useEnter(0);
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <Center>
      <Card tilt={-0.6} style={{ ...dropIn(p, -1), width: vertical ? "100%" : 1500 * u, maxWidth: "100%", boxSizing: "border-box" }}>
        {title && <div style={{ fontFamily: fonts.serif, fontWeight: 800, fontSize: 56 * u, lineHeight: 1.1, color: color.ink, marginBottom: 34 * u }}>{title}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 * u }}>
          {items.map((it, i) => (
            <BarRow key={i} {...it} max={max} prefix={prefix} unit={unit} delay={0.3 + i * 0.22} />
          ))}
        </div>
      </Card>
    </Center>
  );
};

