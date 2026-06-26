import "./index.css";
import { CalculateMetadataFunction, Composition } from "remotion";
import { TextAnimation, TextAnimationProps } from "./TextAnimation";
import { BrandTitle, BrandTitleProps } from "./BrandTitle";
import { BrandCard, BrandCardProps } from "./BrandCard";
import { Captions } from "./Captions";
import { OfferCard } from "./OfferCard";
import { LowerThird } from "./LowerThird";
import { ReviewCard } from "./ReviewCard";
import { CustomScene } from "./CustomScene";

const DIMS: Record<TextAnimationProps["orientation"], [number, number]> = {
  vertical: [1080, 1920],
  horizontal: [1920, 1080],
  square: [1080, 1080],
};

const FPS = 30;

// duration-only metadata (dimensions are overridden per export / preview)
const durMeta = (def: number): CalculateMetadataFunction<{ durationInSeconds?: number }> => ({ props }) => ({
  durationInFrames: Math.max(1, Math.round((props.durationInSeconds ?? def) * FPS)),
});

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

      {/* UGC word-by-word captions */}
      <Composition
        id="Captions"
        component={Captions}
        calculateMetadata={durMeta(3)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          text: "यो प्रोडक्ट साँच्चै राम्रो छ",
          textColor: "#FFFFFF",
          accentColor: "#E8491F",
          bgColor: "transparent",
          boxBehind: true,
          position: "center",
          fontScale: 1,
          fontWeight: 800,
          durationInSeconds: 3,
        }}
      />

      {/* CTA / offer card */}
      <Composition
        id="OfferCard"
        component={OfferCard}
        calculateMetadata={durMeta(3)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          headline: "50% OFF",
          subtitle: "On all renovation packages this month",
          ctaText: "ORDER NOW",
          bgColor: "#0E3A33",
          primaryColor: "#1A5C4F",
          accentColor: "#E8491F",
          textColor: "#FFFFFF",
          fontScale: 1,
          fontWeight: 900,
          durationInSeconds: 3,
        }}
      />

      {/* lower third name tag */}
      <Composition
        id="LowerThird"
        component={LowerThird}
        calculateMetadata={durMeta(4)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          title: "AASHRAY Construction",
          subtitle: "Renovation & Interior Experts",
          side: "left",
          barColor: "#0E3A33",
          accentColor: "#E8491F",
          textColor: "#FFFFFF",
          fontScale: 1,
          fontWeight: 800,
          durationInSeconds: 4,
        }}
      />

      {/* review / stars card */}
      <Composition
        id="ReviewCard"
        component={ReviewCard}
        calculateMetadata={durMeta(4)}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          quote: "Excellent work, finished on time and on budget!",
          name: "Sita Sharma",
          rating: 5,
          bgColor: "#F1EBE1",
          primaryColor: "#0E3A33",
          accentColor: "#E8491F",
          textColor: "#0E3A33",
          fontScale: 1,
          durationInSeconds: 4,
        }}
      />

      {/* custom layer-based scene (from the editor) */}
      <Composition
        id="CustomScene"
        component={CustomScene}
        calculateMetadata={durMeta(4)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          durationInSeconds: 4,
          scene: {
            background: "#101826",
            layers: [
              { id: "a", type: "text", text: "Your text", xPct: 50, yPct: 50, sizePct: 9, color: "#FFFFFF", fontKey: "mukta", fontWeight: 800, align: "center", animateIn: "pop", delay: 0 },
            ],
          },
        }}
      />
    </>
  );
};
