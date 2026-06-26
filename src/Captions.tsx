import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { mukta } from "./fonts";

export type CaptionsProps = {
  text: string;
  textColor?: string;
  accentColor?: string;
  bgColor?: string;
  boxBehind?: boolean;
  position?: "center" | "bottom";
  fontScale?: number;
  fontWeight?: number;
  durationInSeconds: number;
};

// UGC-style word-by-word captions: words build up and the current word is highlighted.
export const Captions: React.FC<CaptionsProps> = ({
  text,
  textColor = "#FFFFFF",
  accentColor = "#E8491F",
  bgColor = "transparent",
  boxBehind = true,
  position = "center",
  fontScale = 1,
  fontWeight = 800,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, durationInFrames } = useVideoConfig();

  const words = text.split(/\s+/).filter(Boolean);
  const fontSize = Math.round(width * 0.082 * fontScale);

  const start = 3;
  const end = Math.max(start + 1, durationInFrames * 0.88);
  const per = (end - start) / Math.max(words.length, 1);
  const lead = Math.max(
    1,
    Math.min(words.length, Math.floor(interpolate(frame, [start, end], [1, words.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))),
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        justifyContent: position === "bottom" ? "flex-end" : "center",
        alignItems: "center",
        padding: "6%",
        paddingBottom: position === "bottom" ? "14%" : "6%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.12em 0.3em",
          maxWidth: "92%",
          fontFamily: mukta,
          fontWeight,
          fontSize,
          lineHeight: 1.18,
          textAlign: "center",
          background: boxBehind ? "rgba(0,0,0,0.5)" : "transparent",
          padding: boxBehind ? "0.35em 0.55em" : 0,
          borderRadius: boxBehind ? "0.25em" : 0,
        }}
      >
        {words.map((w, i) => {
          if (i >= lead) return null;
          const delay = start + i * per;
          const s = spring({ frame: frame - delay, fps, config: { damping: 12, mass: 0.5, stiffness: 170 } });
          const isCurrent = i === lead - 1;
          const scale = interpolate(s, [0, 1], [0.6, isCurrent ? 1.08 : 1]);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                transform: `scale(${scale})`,
                color: isCurrent ? accentColor : textColor,
                textShadow: "0 3px 12px rgba(0,0,0,0.5)",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
