// The whole video is described by one JSON file (projects/<name>/video.json).
// Times are in seconds. Scenes play back-to-back in the order they appear.

export type Accent = "mustard" | "red" | "teal" | "ink";

export type Caption = { start: number; end: number; text: string };

export type SceneBase = {
  /** Seconds this scene stays on screen. */
  duration: number;
  /** Narration for this scene. Used for timing and, if `captions` is absent, for burned-in captions. */
  say?: string;
  /** Small note in the bottom-left corner, e.g. "Source: IMF, 2026". */
  source?: string;
  /** Year / date badge in the top-left corner. */
  badge?: string;
  /** Slow camera move over the scene (default "drift"). */
  camera?: Camera;
  /** How this scene leaves (default from meta.transition, else "slide"). */
  transition?: Transition;
  /** Set false to mute this scene's sound effects. */
  sfx?: boolean;
  /** Narration audio for this scene (written by `npm run voice`), relative to the project folder. */
  voice?: string;
  /** Caption cues for `voice`, in seconds from the start of the voice clip. */
  voiceCues?: Caption[];
  /** Hash of the text + voice used, so unchanged scenes are not re-generated. */
  voiceHash?: string;
  /** Spoken length of `voice` in seconds. */
  voiceLength?: number;
};

/** Narration starts this long after its scene begins, so the visual lands first. */
export const VOICE_LEAD = 0.25;

export type Camera = "drift" | "still" | "push" | "pull" | "pan-left" | "pan-right";
export type Transition = "slide" | "page" | "fade";
export type Stage = "paper" | "grid" | "map";

export type TitleScene = SceneBase & {
  type: "title";
  kicker?: string;
  title: string;
  /** Word inside `title` that gets the hand-drawn underline. */
  underline?: string;
  accent?: Accent;
};

export type ChapterScene = SceneBase & {
  type: "chapter";
  number: number;
  title: string;
};

export type BigNumberScene = SceneBase & {
  type: "bigNumber";
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  accent?: Accent;
};

export type BarItem = { label: string; value: number; highlight?: boolean };
export type BarsScene = SceneBase & {
  type: "bars";
  title?: string;
  /** Shown before values, e.g. "$". */
  prefix?: string;
  /** Shown after values, e.g. "%" or "M". */
  unit?: string;
  items: BarItem[];
};

export type ProgressScene = SceneBase & {
  type: "progress";
  /** e.g. 32 of 45 */
  value: number;
  total: number;
  label: string;
  accent?: Accent;
};

export type DocumentScene = SceneBase & {
  type: "document";
  heading: string;
  lines?: number;
  stamp?: string;
  /** Two options; the `checked` one gets ticked. */
  options?: [string, string];
  checked?: 0 | 1;
  tag?: string;
};

export type VersusScene = SceneBase & {
  type: "versus";
  left: { title: string; subtitle?: string; points?: string[] };
  right: { title: string; subtitle?: string; points?: string[] };
};

export type Pose = "stand" | "point" | "think" | "shrug" | "cheer" | "worried";
export type FigureScene = SceneBase & {
  type: "figure";
  pose: Pose;
  /** Optional second figure on the right. */
  pose2?: Pose;
  sign?: string;
  bubble?: string;
  note?: string;
};

export type TimelineEvent = { year: string; label: string };
export type TimelineScene = SceneBase & {
  type: "timeline";
  title?: string;
  events: TimelineEvent[];
};

export type ListScene = SceneBase & {
  type: "list";
  title: string;
  items: string[];
  style?: "check" | "number" | "cross";
};

export type QuoteScene = SceneBase & {
  type: "quote";
  quote: string;
  author?: string;
};

export type LineScene = SceneBase & {
  type: "line";
  title?: string;
  points: { x: string; y: number }[];
  prefix?: string;
  unit?: string;
  accent?: Accent;
};

export type PhotoItem = {
  /** Image file in the project folder, e.g. "images/harbor.jpg". */
  src: string;
  /** card = print with white border and tape; torn = torn paper edge; cutout = transparent PNG with sticker outline. */
  style?: "card" | "torn" | "cutout";
  treatment?: "color" | "mono" | "halftone";
  caption?: string;
};
export type PhotoScene = SceneBase & {
  type: "photo";
  /** 1–3 images, laid out as a collage. */
  images: PhotoItem[];
  title?: string;
  /** Red torn-paper tag, e.g. "$116" or "1913". */
  tag?: string;
};

export type MapScene = SceneBase & {
  type: "map";
  title?: string;
  /** Country names as in Natural Earth, e.g. "Brazil", "United States of America". */
  highlight?: string[];
  pins?: { lon: number; lat: number; label?: string }[];
  /** Points drawn as a travelling line, [lon, lat] each. */
  route?: [number, number][];
  /** "world" shows the whole map; otherwise the view fits highlight + pins + route. */
  view?: "fit" | "world";
  accent?: Accent;
};

export type Scene =
  | PhotoScene
  | MapScene
  | TitleScene
  | ChapterScene
  | BigNumberScene
  | BarsScene
  | ProgressScene
  | DocumentScene
  | VersusScene
  | FigureScene
  | TimelineScene
  | ListScene
  | QuoteScene
  | LineScene;

export type VideoSpec = {
  meta: {
    title: string;
    fps?: number;
    format?: "landscape" | "vertical";
    /** Burn captions into the video (default true). */
    captions?: boolean;
    /** Background: plain paper (default), graph paper, or a faint world map. */
    stage?: Stage;
    /** Default scene exit for every scene. */
    transition?: Transition;
    /** Sound effects volume 0–1 (default 0.6). 0 turns them off. */
    sfxVolume?: number;
    /** ElevenLabs voice id used by `npm run voice`. */
    voice?: string;
  };
  /** File in public/ (e.g. "demo/voice.mp3"). Optional. */
  voiceover?: string;
  music?: { file: string; volume?: number };
  scenes: Scene[];
  captions?: Caption[];
};
