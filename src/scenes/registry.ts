import type { Scene } from "../schema";
import { Title, Chapter, BigNumber, Bars, List, Quote } from "./core";

// Scene type → component. Keep in sync with scenes.json (used by the CLI scripts).
export const SCENES: Partial<Record<Scene["type"], React.FC<any>>> = {
  title: Title,
  chapter: Chapter,
  bigNumber: BigNumber,
  bars: Bars,
  list: List,
  quote: Quote,
};
