import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { mukta } from "./fonts";

export type LowerThirdProps = {
  title: string;
  subtitle: string;
  side?: "left" | "right";
  barColor?: string;
  accentColor?: string;
  textColor?: string;
  fontScale?: number;
  fontWeight?: number;
  durationInSeconds: number;
};

// Transparent-background name tag that slides in near the bottom.
export const LowerThird: React.FC<LowerThirdProps> = ({
  title,
  subtitle,
  side = "left",
  barColor = "#0E3A33",
  accentColor = "#E8491F",
  textColor = "#FFFFFF",
  fontScale = 1,
  fontWeight = 800,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = Math.min(width, height);

  const intro = spring({ frame, fps, config: { damping: 18, mass: 0.8 } });
  const slide = interpolate(intro, [0, 1], [-1, 0]); // -1 fully off (left)
  const tab = spring({ frame: frame - 2, fps, config: { damping: 16 } });
  const textReveal = interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textX = interpolate(spring({ frame: frame - 10, fps, config: { damping: 200 } }), [0, 1], [20, 0]);

  const titleSize = base * 0.052 * fontScale;
  const subSize = base * 0.03 * fontScale;
  const offX = side === "left" ? width * 0.06 : undefined;
  const offXRight = side === "right" ? width * 0.06 : undefined;
  const slidePx = slide * (width * 0.5) * (side === "right" ? -1 : 1);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <div
        style={{
          position: "absolute",
          bottom: height * 0.12,
          left: offX,
          right: offXRight,
          display: "flex",
          alignItems: "stretch",
          transform: `translateX(${slidePx}px)`,
          flexDirection: side === "right" ? "row-reverse" : "row",
        }}
      >
        {/* accent tab */}
        <div style={{ width: base * 0.014, background: accentColor, borderRadius: 4, transform: `scaleY(${tab})`, transformOrigin: "bottom" }} />
        {/* bar */}
        <div
          style={{
            background: barColor,
            padding: `${base * 0.022}px ${base * 0.04}px`,
            margin: side === "right" ? "0 12px 0 0" : "0 0 0 12px",
            borderRadius: 8,
            boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: mukta,
              fontWeight,
              fontSize: titleSize,
              color: textColor,
              lineHeight: 1.05,
              opacity: textReveal,
              transform: `translateX(${textX}px)`,
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontFamily: mukta,
                fontWeight: 600,
                fontSize: subSize,
                color: accentColor,
                marginTop: base * 0.006,
                opacity: textReveal,
                transform: `translateX(${textX}px)`,
                whiteSpace: "nowrap",
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
