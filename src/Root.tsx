import "./index.css";
import { CalculateMetadataFunction, Composition } from "remotion";
import { TextAnimation, TextAnimationProps } from "./TextAnimation";
import { BrandTitle, BrandTitleProps } from "./BrandTitle";
import { BrandCard, BrandCardProps } from "./BrandCard";

const DIMS: Record<TextAnimationProps["orientation"], [number, number]> = {
  vertical: [1080, 1920],
  horizontal: [1920, 1080],
  square: [1080, 1080],
};

const FPS = 30;

const calculateMetadata: CalculateMetadataFunction<TextAnimationProps> = ({ props }) => {
  const [width, height] = DIMS[props.orientation] ?? DIMS.vertical;
  return {
    width,
    height,
    fps: FPS,
    durationInFrames: Math.max(1, Math.round((props.durationInSeconds ?? 3) * FPS)),
  };
};

const brandMetadata: CalculateMetadataFunction<BrandTitleProps> = ({ props }) => ({
  durationInFrames: Math.max(1, Math.round((props.durationInSeconds ?? 2) * FPS)),
});

const cardMetadata: CalculateMetadataFunction<BrandCardProps> = ({ props }) => ({
  durationInFrames: Math.max(1, Math.round((props.durationInSeconds ?? 5) * FPS)),
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* AASHRAY branded tagline card */}
      <Composition
        id="BrandTitle"
        component={BrandTitle}
        calculateMetadata={brandMetadata}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          text: "सोचेजस्तो बन्ला कि नबन्ला?",
          durationInSeconds: 2,
          brandName: "AASHRAY",
          bgColor: "#082420",
          primaryColor: "#0E3A33",
          accentColor: "#E8491F",
          textColor: "#FFFFFF",
          fontScale: 1,
          fontWeight: 800,
        }}
      />

      {/* AASHRAY logo + contact card */}
      <Composition
        id="BrandCard"
        component={BrandCard}
        calculateMetadata={cardMetadata}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          name: "AASHRAY",
          tagline: "RENOVATION AND CONSTRUCTION SOLUTIONS",
          location: "Imadol, Lalitpur",
          email: "info@aashrayrenovationandconstructionsolution.co",
          phone: "9705218192",
          durationInSeconds: 5,
          logoSrc: null,
          bgColor: "#F1EBE1",
          primaryColor: "#0E3A33",
          accentColor: "#E8491F",
          textColor: "#0E3A33",
          fontScale: 1,
          fontWeight: 800,
        }}
      />

      {/* generic reusable text-animation engine */}
      <Composition
        id="TextAnimation"
        component={TextAnimation}
        calculateMetadata={calculateMetadata}
        defaultProps={{
          text: "नयाँ सुरुवात",
          animation: "kineticScale",
          fontKey: "mukta",
          color: "#FFFFFF",
          textColor: "#FFFFFF",
          bgColor: "transparent",
          accentColor: "#E8491F",
          uppercase: false,
          fontWeight: 800,
          fontScale: 1,
          letterSpacingPx: 2,
          fontSizePx: null,
          orientation: "vertical",
          durationInSeconds: 3,
        }}
      />
    </>
  );
};
