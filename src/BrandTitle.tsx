import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { mukta, poppins } from "./fonts";

export type BrandTitleProps = {
  text: string;
  durationInSeconds: number;
  brandName?: string;
  bgColor?: string;
  primaryColor?: string;
  accentColor?: string;
  textColor?: string;
  fontScale?: number;
  fontWeight?: number;
};

const frac = (x: number) => x - Math.floor(x);
const rand = (i: number, seed: number) => frac(Math.sin((i + 1) * seed) * 43758.5453);
const PARTICLE_COUNT = 46;

export const BrandTitle: React.FC<BrandTitleProps> = ({
  text,
  brandName = "AASHRAY",
  bgColor = "#0E3A33",
  primaryColor = "#1A5C4F",
  accentColor = "#E8491F",
  textColor = "#FFFFFF",
  fontScale = 1,
  fontWeight = 800,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const words = text.split(" ");
  const lastIdx = words.length - 1;
  const fontSize = Math.round(width * 0.07 * fontScale);

  const wordBase = 9;
  const wordStagger = 5;
  const cleanWord = (w: string) => w.replace(/[?!।.,]/g, "");
  const wordFrame = (target: string) => {
    const idx = words.findIndex((w) => cleanWord(w) === target);
    return idx >= 0 ? wordBase + idx * wordStagger : null;
  };
  const moneyStart = wordFrame("बजेट");
  const timerStart = wordFrame("समयमै");

  const bgScale = interpolate(frame, [0, durationInFrames], [1.08, 1]);
  const gridOpacity = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: "clamp" });
  const fieldOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const glowOpacity = interpolate(frame, [6, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const kicker = spring({ frame: frame - 3, fps, config: { damping: 200 } });
  const kickerY = interpolate(kicker, [0, 1], [-18, 0]);

  const uDelay = wordBase + words.length * wordStagger + 1;
  const underline = spring({ frame: frame - uDelay, fps, config: { damping: 18, stiffness: 110 } });

  const sweepX = interpolate(frame, [38, 60], [-0.5, 1.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sweepOpacity = interpolate(frame, [38, 46, 60], [0, 0.45, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const float = Math.sin(frame * 0.06) * 4;

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden" }}>
      {/* gradient depth from the brand primary color */}
      <AbsoluteFill
        style={{
          transform: `scale(${bgScale})`,
          background: `radial-gradient(circle at 50% 42%, ${primaryColor} 0%, ${bgColor} 58%, ${bgColor} 100%)`,
        }}
      />

      {/* blueprint grid */}
      <AbsoluteFill
        style={{
          opacity: gridOpacity * 0.5,
          transform: `translate(${(frame * 0.25) % 64}px, ${(frame * 0.15) % 64}px) scale(1.1)`,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* falling Nepali rupee notes — synced to "बजेट" */}
      {moneyStart !== null && (
        <AbsoluteFill
          style={{
            opacity: interpolate(
              frame,
              [moneyStart, moneyStart + 8, moneyStart + 40, moneyStart + 75],
              [0, 0.6, 0.5, 0.16],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
          }}
        >
          {Array.from({ length: 16 }).map((_, i) => {
            const nx = rand(i, 3.7);
            const baseY = rand(i, 9.13);
            const scale = 0.7 + rand(i, 5.31) * 0.7;
            const fall = 11 + rand(i, 2.11) * 9;
            const swayPh = rand(i, 6.7) * Math.PI * 2;
            const rotDir = rand(i, 8.9) > 0.5 ? 1 : -1;
            const local = Math.max(0, frame - moneyStart);
            const y = ((baseY * height + local * fall) % (height + 200)) - 100;
            const x = nx * width + Math.sin(frame * 0.04 + swayPh) * 22;
            const rot = (frame * 1.6 + i * 30) * rotDir;
            const flip = Math.cos((frame + i * 12) * 0.12);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: 78 * scale,
                  height: 42 * scale,
                  borderRadius: 6,
                  background: "linear-gradient(135deg, #2E8B57 0%, #43c585 100%)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `rotate(${rot}deg) scaleX(${flip})`,
                }}
              >
                <span style={{ fontFamily: mukta, fontWeight: 700, fontSize: 19 * scale, color: "rgba(255,255,255,0.9)" }}>
                  रू
                </span>
              </div>
            );
          })}
        </AbsoluteFill>
      )}

      {/* sweeping stopwatch — synced to "समयमै" */}
      {timerStart !== null && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              opacity: interpolate(frame, [timerStart, timerStart + 12], [0, 0.22], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              transform: `scale(${interpolate(
                spring({ frame: frame - timerStart, fps, config: { damping: 200 } }),
                [0, 1],
                [0.7, 1],
              )})`,
            }}
          >
            <svg width={height * 0.52} height={height * 0.52} viewBox="0 0 200 200" fill="none">
              <rect x="92" y="6" width="16" height="9" rx="2" fill={textColor} />
              <rect x="96" y="14" width="8" height="8" fill={textColor} />
              <circle cx="100" cy="108" r="84" stroke={textColor} strokeWidth="3" />
              <circle cx="100" cy="108" r="78" stroke={accentColor} strokeWidth="1.5" opacity="0.7" />
              {Array.from({ length: 12 }).map((_, k) => {
                const a = (k * 30 * Math.PI) / 180;
                const major = k % 3 === 0;
                const r1 = 74;
                const r2 = major ? 62 : 68;
                return (
                  <line
                    key={k}
                    x1={100 + r1 * Math.sin(a)}
                    y1={108 - r1 * Math.cos(a)}
                    x2={100 + r2 * Math.sin(a)}
                    y2={108 - r2 * Math.cos(a)}
                    stroke={textColor}
                    strokeWidth={major ? 4 : 2}
                  />
                );
              })}
              <line
                x1="100"
                y1="108"
                x2="100"
                y2="44"
                stroke={accentColor}
                strokeWidth="4"
                strokeLinecap="round"
                transform={`rotate(${(frame - timerStart) * 9} 100 108)`}
              />
              <circle cx="100" cy="108" r="7" fill={accentColor} />
            </svg>
          </div>
        </AbsoluteFill>
      )}

      {/* particle field */}
      <AbsoluteFill style={{ opacity: fieldOpacity }}>
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
          const px = rand(i, 12.9898);
          const py = rand(i, 78.233);
          const size = 2 + rand(i, 37.71) * 5;
          const speed = 0.15 + rand(i, 4.31) * 0.5;
          const phase = rand(i, 91.7) * Math.PI * 2;
          const isOrange = rand(i, 7.13) > 0.78;
          let y = (py * height - frame * speed * 1.6) % height;
          if (y < 0) y += height;
          const x = px * width + Math.sin(frame * 0.02 + phase) * 18;
          const twinkle = 0.12 + 0.16 * (0.5 + 0.5 * Math.sin(frame * 0.06 + phase));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundColor: isOrange ? accentColor : textColor,
                opacity: twinkle,
                filter: size > 5 ? "blur(1.5px)" : "none",
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* glow behind text */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: width * 0.62,
            height: height * 0.34,
            opacity: glowOpacity,
            filter: "blur(30px)",
            background: `radial-gradient(ellipse, ${accentColor}4D 0%, transparent 70%)`,
          }}
        />
      </AbsoluteFill>

      {/* vignette */}
      <AbsoluteFill
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.5) 100%)" }}
      />

      {/* kicker + tagline */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          transform: `translateY(${float}px)`,
        }}
      >
        {brandName ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              opacity: kicker,
              transform: `translateY(${kickerY}px)`,
              marginBottom: fontSize * 0.42,
            }}
          >
            <div style={{ width: width * 0.05, height: 2, background: accentColor, opacity: 0.9 }} />
            <span
              style={{
                fontFamily: poppins,
                fontWeight: 600,
                fontSize: Math.round(width * 0.0175),
                letterSpacing: Math.round(width * 0.006),
                color: textColor,
                paddingLeft: Math.round(width * 0.006),
              }}
            >
              {brandName.toUpperCase()}
            </span>
            <div style={{ width: width * 0.05, height: 2, background: accentColor, opacity: 0.9 }} />
          </div>
        ) : null}

        <div style={{ position: "relative", display: "inline-block", maxWidth: "90%" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0 0.26em",
              fontFamily: mukta,
              fontWeight,
              fontSize,
              lineHeight: 1.1,
              letterSpacing: 0.5,
              textAlign: "center",
            }}
          >
            {words.map((word, i) => {
              const delay = wordBase + i * wordStagger;
              const s = spring({ frame: frame - delay, fps, config: { damping: 15, mass: 0.7, stiffness: 120 } });
              const opacity = interpolate(frame - delay, [0, 9], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              });
              const translateY = interpolate(s, [0, 1], [50, 0]);
              const blur = interpolate(s, [0, 1], [10, 0]);
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    opacity,
                    transform: `translateY(${translateY}px)`,
                    filter: `blur(${blur}px)`,
                    color: i === lastIdx ? accentColor : textColor,
                    textShadow: "0 6px 28px rgba(0,0,0,0.4)",
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>

          <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${sweepX * 100}%`,
                width: "22%",
                transform: "skewX(-18deg)",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                mixBlendMode: "screen",
                opacity: sweepOpacity,
              }}
            />
          </AbsoluteFill>

          <div
            style={{
              position: "absolute",
              left: "12%",
              right: "12%",
              bottom: -fontSize * 0.24,
              height: Math.max(6, fontSize * 0.055),
              borderRadius: 999,
              backgroundColor: accentColor,
              transform: `scaleX(${underline})`,
              transformOrigin: "left center",
              boxShadow: `0 0 20px ${accentColor}`,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
