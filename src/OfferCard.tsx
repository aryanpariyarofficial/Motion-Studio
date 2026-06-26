import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { mukta, poppins } from "./fonts";

export type OfferCardProps = {
  headline: string;
  subtitle: string;
  ctaText: string;
  bgColor?: string;
  primaryColor?: string;
  accentColor?: string;
  textColor?: string;
  fontScale?: number;
  fontWeight?: number;
  durationInSeconds: number;
};

export const OfferCard: React.FC<OfferCardProps> = ({
  headline,
  subtitle,
  ctaText,
  bgColor = "#0E3A33",
  primaryColor = "#1A5C4F",
  accentColor = "#E8491F",
  textColor = "#FFFFFF",
  fontScale = 1,
  fontWeight = 900,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const base = Math.min(width, height);

  const bgScale = interpolate(frame, [0, durationInFrames], [1.08, 1]);

  // starburst behind headline
  const burst = interpolate(frame, [4, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const burstRot = frame * 0.3;

  const head = spring({ frame: frame - 6, fps, config: { damping: 12, mass: 0.8, stiffness: 130 } });
  const headScale = interpolate(head, [0, 1], [0.3, 1]);
  const headOpacity = interpolate(frame, [6, 14], [0, 1], { extrapolateRight: "clamp" });

  const subY = interpolate(spring({ frame: frame - 18, fps, config: { damping: 200 } }), [0, 1], [24, 0]);
  const subOpacity = interpolate(frame, [18, 30], [0, 1], { extrapolateRight: "clamp" });

  const cta = spring({ frame: frame - 30, fps, config: { damping: 9, mass: 0.6, stiffness: 150 } });
  const ctaPulse = 1 + Math.sin(frame * 0.18) * 0.03 * interpolate(frame, [40, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden", justifyContent: "center", alignItems: "center" }}>
      <AbsoluteFill style={{ transform: `scale(${bgScale})`, background: `radial-gradient(circle at 50% 45%, ${primaryColor} 0%, ${bgColor} 60%)` }} />

      {/* starburst */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: burst * 0.18 }}>
        <svg width={base * 1.4} height={base * 1.4} viewBox="0 0 200 200" style={{ transform: `rotate(${burstRot}deg)` }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i * 15 * Math.PI) / 180;
            return (
              <line key={i} x1="100" y1="100" x2={100 + 140 * Math.cos(a)} y2={100 + 140 * Math.sin(a)} stroke={accentColor} strokeWidth="6" />
            );
          })}
        </svg>
      </AbsoluteFill>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: base * 0.03, padding: "8%" }}>
        <div
          style={{
            fontFamily: mukta,
            fontWeight,
            fontSize: base * 0.2 * fontScale,
            color: textColor,
            lineHeight: 1,
            textAlign: "center",
            opacity: headOpacity,
            transform: `scale(${headScale})`,
            textShadow: `0 8px 30px rgba(0,0,0,0.4)`,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontFamily: mukta,
            fontWeight: 600,
            fontSize: base * 0.045 * fontScale,
            color: textColor,
            opacity: subOpacity * 0.92,
            transform: `translateY(${subY}px)`,
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          {subtitle}
        </div>
        {ctaText ? (
          <div
            style={{
              marginTop: base * 0.02,
              transform: `scale(${Math.max(0, cta) * ctaPulse})`,
              background: accentColor,
              color: "#fff",
              fontFamily: poppins,
              fontWeight: 700,
              fontSize: base * 0.045 * fontScale,
              letterSpacing: 1,
              padding: `${base * 0.022}px ${base * 0.06}px`,
              borderRadius: 999,
              boxShadow: `0 10px 30px ${accentColor}66`,
            }}
          >
            {ctaText}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
