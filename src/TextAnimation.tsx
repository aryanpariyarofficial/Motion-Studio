import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONTS, FontKey } from "./fonts";

export type AnimationStyle =
  | "typewriter"
  | "wordPop"
  | "fadeSlideUp"
  | "letterCascade"
  | "glitch"
  | "neonGlow"
  | "kineticScale";

export type TextAnimationProps = {
  text: string;
  animation: AnimationStyle;
  fontKey: FontKey;
  color: string;
  textColor?: string;
  bgColor?: string;
  accentColor?: string;
  uppercase: boolean;
  fontWeight: number;
  letterSpacingPx: number;
  fontSizePx: number | null;
  fontScale?: number;
  orientation: "vertical" | "horizontal" | "square";
  durationInSeconds: number;
};

// deterministic pseudo-noise in [-1, 1], stable per frame
const noise = (frame: number, seed: number) =>
  Math.sin(frame * seed * 0.7) * Math.cos(frame * seed * 1.31 + seed);

export const TextAnimation: React.FC<TextAnimationProps> = ({
  text,
  animation,
  fontKey,
  color,
  textColor,
  bgColor = "transparent",
  accentColor = "#E8491F",
  uppercase,
  fontWeight,
  letterSpacingPx,
  fontSizePx,
  fontScale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const fontFamily = FONTS[fontKey];
  const ink = textColor ?? color;
  const display = uppercase ? text.toUpperCase() : text;

  // auto-fit: scale the font to the frame & text length so it never spills out,
  // regardless of aspect ratio. The user's fontScale fine-tunes on top.
  const inkLen = Math.max(display.replace(/\s+/g, "").length, 1);
  let autoFit = Math.sqrt(width * 0.86 * (height * 0.8) / inkLen) * 0.5;
  autoFit = Math.min(autoFit, height * 0.35, width * 0.42);
  const fontSize = Math.round((fontSizePx ?? autoFit) * fontScale);

  const base: React.CSSProperties = {
    fontFamily,
    color: ink,
    fontWeight,
    fontSize,
    letterSpacing: letterSpacingPx,
    lineHeight: 1.08,
    textAlign: "center",
    maxWidth: "86%",
    margin: 0,
    padding: 0,
  };

  const container: React.CSSProperties = {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: bgColor,
    padding: "5%",
    overflow: "hidden",
  };

  if (animation === "fadeSlideUp") {
    const enter = spring({ frame, fps, config: { damping: 200 } });
    const translateY = interpolate(enter, [0, 1], [70, 0]);
    return (
      <AbsoluteFill style={container}>
        <div style={{ ...base, opacity: enter, transform: `translateY(${translateY}px)` }}>{display}</div>
      </AbsoluteFill>
    );
  }

  if (animation === "kineticScale") {
    const s = spring({ frame, fps, config: { damping: 13, mass: 0.9, stiffness: 120 } });
    const scale = interpolate(s, [0, 1], [1.6, 1]);
    const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
    return (
      <AbsoluteFill style={container}>
        <div style={{ ...base, opacity, transform: `scale(${scale})` }}>{display}</div>
      </AbsoluteFill>
    );
  }

  if (animation === "wordPop") {
    const words = display.split(" ");
    return (
      <AbsoluteFill style={container}>
        <div style={{ ...base, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0.28em" }}>
          {words.map((word, i) => {
            const delay = i * 5;
            const s = spring({ frame: frame - delay, fps, config: { damping: 10, mass: 0.6, stiffness: 130 } });
            const opacity = interpolate(frame - delay, [0, 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <span key={i} style={{ display: "inline-block", transform: `scale(${s})`, opacity }}>
                {word}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  if (animation === "letterCascade") {
    const chars = display.split("");
    return (
      <AbsoluteFill style={container}>
        <div style={{ ...base, whiteSpace: "pre-wrap" }}>
          {chars.map((ch, i) => {
            if (ch === " ") return <span key={i}> </span>;
            const delay = i * 2.5;
            const s = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.5, stiffness: 140 } });
            const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const translateY = interpolate(s, [0, 1], [45, 0]);
            return (
              <span key={i} style={{ display: "inline-block", opacity, transform: `translateY(${translateY}px)` }}>
                {ch}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  if (animation === "typewriter") {
    const revealFrames = Math.max(1, durationInFrames * 0.7);
    const count = Math.floor(
      interpolate(frame, [0, revealFrames], [0, display.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    );
    const cursorOn = Math.floor(frame / (fps * 0.4)) % 2 === 0;
    return (
      <AbsoluteFill style={container}>
        <div style={{ ...base }}>
          {display.slice(0, count)}
          <span style={{ opacity: cursorOn ? 1 : 0 }}>|</span>
        </div>
      </AbsoluteFill>
    );
  }

  if (animation === "glitch") {
    const settle = interpolate(frame, [0, fps * 0.9], [1, 0], { extrapolateRight: "clamp" });
    const opacity = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
    const dx = noise(frame, 2.3) * 12 * settle;
    const dy = noise(frame, 3.1) * 5 * settle;
    const skew = noise(frame, 1.7) * 7 * settle;
    const split = 3 + 7 * settle;
    return (
      <AbsoluteFill style={container}>
        <div
          style={{
            ...base,
            opacity,
            transform: `translate(${dx}px, ${dy}px) skewX(${skew}deg)`,
            textShadow: `${split}px 0 rgba(255,0,90,0.85), ${-split}px 0 rgba(0,231,255,0.85)`,
          }}
        >
          {display}
        </div>
      </AbsoluteFill>
    );
  }

  if (animation === "neonGlow") {
    const enter = interpolate(frame, [0, fps * 0.5], [0, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 2 * 0.8);
    const glow = 10 + pulse * 12;
    const scale = interpolate(enter, [0, 1], [0.9, 1]);
    return (
      <AbsoluteFill style={container}>
        <div
          style={{
            ...base,
            color: "#ffffff",
            opacity: enter,
            transform: `scale(${scale})`,
            textShadow: `0 0 ${glow * 0.4}px #fff, 0 0 ${glow}px ${accentColor}, 0 0 ${glow * 2}px ${accentColor}, 0 0 ${glow * 3.2}px ${accentColor}`,
          }}
        >
          {display}
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={container}>
      <div style={base}>{display}</div>
    </AbsoluteFill>
  );
};
