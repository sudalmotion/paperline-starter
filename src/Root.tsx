import { Composition } from "remotion";
import type { VideoSpec } from "./schema";
import { PaperlineVideo, totalFrames } from "./Video";
import demo from "../projects/demo/video.json";

const size = (spec: VideoSpec) => (spec.meta.format === "vertical" ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 });

export const Root: React.FC = () => (
  <Composition
    id="Paperline"
    component={PaperlineVideo}
    defaultProps={demo as VideoSpec}
    fps={30}
    width={1920}
    height={1080}
    durationInFrames={300}
    calculateMetadata={({ props }) => {
      const fps = props.meta.fps ?? 30;
      return { fps, durationInFrames: totalFrames(props, fps), ...size(props) };
    }}
  />
);
