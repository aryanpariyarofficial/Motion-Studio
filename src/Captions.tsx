import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { mukta } from "./fonts";

export type CaptionStyle = "highlight" | "box" | "dynamic" | "karaoke";

export type CaptionsProps = {
  text: string;
  captionStyle?: CaptionStyle;
  textColor?: string;
  accentColor?: string;
  bgColor?: string;
  boxBehind?: boolean;
  position?: "center" | "bottom";
  fontScale?: number;
  fontWeight?: number;
  durationInSeconds: number;
};

// deterministic per-word size pattern for the "dynamic" (AI trending) style
const SIZE_PATTERN = [1, 0.8, 1.22, 0.86, 1.35, 0.82, 1.1];

export const Captions: React.FC<CaptionsProps> = ({
  text,
  captionStyle = "highlight",
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
  const end = Math.max(start + 1, durationInFrames * 0.9);
  const per = (end - start) / Math.max(words.length, 1);
  const active = Math.max(
    0,
    Math.min(words.length - 1, Math.floor(interpolate(frame, [start, end], [0, words.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))),
  );
  // karaoke shows all words from the start; others build up
  const showAll = captionStyle === "karaoke";

  const wrap: React.CSSProperties = {
    backgroundColor: bgColor,
    justifyContent: position === "bottom" ? "flex-end" : "center",
    alignItems: "center",
    padding: "6%",
    paddingBottom: position === "bottom" ? "14%" : "6%",
  };

  const groupBox = boxBehind && captionStyle !== "box"
    ? { background: "rgba(0,0,0,0.5)", padding: "0.35em 0.55em", borderRadius: "0.25em" }
    : {};

  return (
    <AbsoluteFill style={wrap}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.14em 0.3em",
          maxWidth: "92%",
          fontFamily: mukta,
          fontWeight,
          fontSize,
          lineHeight: 1.18,
          textAlign: "center",
          ...groupBox,
        }}
      >
        {words.map((w, i) => {
          const visible = showAll || i <= active;
          if (!visible) return null;
          const isActive = i === active;
          const delay = start + i * per;
          const s = spring({ frame: frame - delay, fps, config: { damping: 12, mass: 0.5, stiffness: 170 } });
          const pop = showAll ? 1 : interpolate(s, [0, 1], [0.6, 1]);

          // ----- per-style word rendering -----
          if (captionStyle === "box") {
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  transform: `scale(${isActive ? pop * 1.05 : 1})`,
                  color: isActive ? "#fff" : textColor,
                  background: isActive ? accentColor : "transparent",
                  padding: isActive ? "0.04em 0.22em" : 0,
                  borderRadius: "0.18em",
                  textShadow: "0 3px 12px rgba(0,0,0,0.5)",
                }}
              >
                {w}
              </span>
            );
          }

          if (captionStyle === "dynamic") {
            const f = SIZE_PATTERN[i % SIZE_PATTERN.length];
            const emphasised = f >= 1.15;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  fontSize: `${f}em`,
                  fontWeight: emphasised ? 900 : 700,
                  lineHeight: 0.95,
                  transform: `scale(${isActive ? pop * 1.06 : 1}) rotate(${emphasised ? -2 : 0}deg)`,
                  color: isActive ? accentColor : emphasised ? accentColor : textColor,
                  textShadow: "0 3px 14px rgba(0,0,0,0.55)",
                }}
              >
                {w}
              </span>
            );
          }

          if (captionStyle === "karaoke") {
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  color: i <= active ? accentColor : textColor,
                  opacity: i <= active ? 1 : 0.55,
                  transition: "color 0.1s",
                  textShadow: "0 3px 12px rgba(0,0,0,0.5)",
                }}
              >
                {w}
              </span>
            );
          }

          // default: highlight
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                transform: `scale(${isActive ? pop * 1.08 : pop})`,
                color: isActive ? accentColor : textColor,
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
