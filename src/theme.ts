import { loadFont as loadSerif } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadHand } from "@remotion/google-fonts/Caveat";
import type { Accent } from "./schema";

const serif = loadSerif("normal", { weights: ["600", "800"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["500", "600"], subsets: ["latin"] });
const sans = loadSans("normal", { weights: ["500", "700"], subsets: ["latin"] });
const hand = loadHand("normal", { weights: ["500", "700"], subsets: ["latin"] });

export const fonts = {
  serif: serif.fontFamily,
  mono: mono.fontFamily,
  sans: sans.fontFamily,
  hand: hand.fontFamily,
};

export const color = {
  paper: "#EEE5D0",
  paperDeep: "#E2D5B8",
  card: "#F7F1E3",
  ink: "#2A251F",
  inkSoft: "#6E6455",
  rule: "rgba(42,37,31,0.14)",
  mustard: "#DFA233",
  red: "#C4523B",
  teal: "#3C7D74",
};

export const accentColor = (a: Accent = "mustard") =>
  a === "ink" ? color.ink : color[a];
