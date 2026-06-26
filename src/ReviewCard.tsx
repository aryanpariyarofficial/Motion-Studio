import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { mukta } from "./fonts";

export type ReviewCardProps = {
  quote: string;
  name: string;
  rating: number;
  bgColor?: string;
  primaryColor?: string;
  accentColor?: string;
  textColor?: string;
  fontScale?: number;
  durationInSeconds: number;
};

const Star: React.FC<{ size: number; fill: string; empty: string; on: boolean; pop: number }> = ({ size, fill, empty, on, pop }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ transform: `scale(${pop})` }}>
    <path
      d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z"
      fill={on ? fill : "none"}
      stroke={on ? fill : empty}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const ReviewCard: React.FC<ReviewCardProps> = ({
  quote,
  name,
  rating = 5,
  bgColor = "#F1EBE1",
  primaryColor = "#0E3A33",
  accentColor = "#E8491F",
  textColor = "#0E3A33",
  fontScale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = Math.min(width, height);

  const starSize = base * 0.09;
  const r = Math.max(0, Math.min(5, Math.round(rating)));

  const quoteY = interpolate(spring({ frame: frame - 20, fps, config: { damping: 200 } }), [0, 1], [26, 0]);
  const quoteOpacity = interpolate(frame, [20, 34], [0, 1], { extrapolateRight: "clamp" });
  const nameOpacity = interpolate(frame, [34, 46], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, ${primaryColor}10, transparent 55%)` }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: base * 0.03, padding: "9%", maxWidth: "86%" }}>
        <div style={{ display: "flex", gap: base * 0.012 }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const s = spring({ frame: frame - (4 + i * 5), fps, config: { damping: 9, mass: 0.5, stiffness: 170 } });
            return <Star key={i} size={starSize} fill={accentColor} empty={`${primaryColor}40`} on={i < r} pop={Math.max(0, s)} />;
          })}
        </div>
        <div
          style={{
            fontFamily: mukta,
            fontWeight: 700,
            fontSize: base * 0.052 * fontScale,
            color: textColor,
            textAlign: "center",
            lineHeight: 1.3,
            opacity: quoteOpacity,
            transform: `translateY(${quoteY}px)`,
          }}
        >
          “{quote}”
        </div>
        <div style={{ fontFamily: mukta, fontWeight: 800, fontSize: base * 0.034 * fontScale, color: accentColor, opacity: nameOpacity }}>
          — {name}
        </div>
      </div>
    </AbsoluteFill>
  );
};
