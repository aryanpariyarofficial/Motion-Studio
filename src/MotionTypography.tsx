import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS, FontKey } from "./fonts";

export type MotionTypographyProps = {
  segments: string; // one segment per line: "TEXT | sizeVw | color | italic"
  secondsPerLoop?: number;
  bgColor?: string;
  inkColor?: string;
  emphasisColor?: string;
  fontKey?: FontKey;
  fontWeight?: number;
  durationInSeconds: number;
};

type Seg = { text: string; sizeVw: number; color: string; italic: boolean };

// auto size-contrast pattern (vw) used when a line doesn't specify a size
const SIZES = [13, 4, 9, 3.2, 16, 5, 8, 3.5, 11, 4.5];

const parseSegments = (raw: string, ink: string, accent: string): Seg[] => {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.map((line, i) => {
    const p = line.split("|").map((s) => s.trim());
    const text = p[0];
    const sizeVw = p[1] && !isNaN(+p[1]) ? +p[1] : SIZES[i % SIZES.length];
    const cRaw = (p[2] || "").toLowerCase();
    let color = ink;
    if (cRaw === "accent") color = accent;
    else if (cRaw === "primary" || cRaw === "ink") color = ink;
    else if (cRaw.startsWith("#")) color = p[2];
    else if (!p[2] && i % 3 === 2) color = accent; // auto-accent every 3rd
    const italRaw = (p[3] || "").toLowerCase();
    const italic = /italic|true|yes|^i$/.test(italRaw) || (!p[3] && i % 4 === 1);
    return { text, sizeVw, color, italic };
  });
};

export const MotionTypography: React.FC<MotionTypographyProps> = ({
  segments,
  secondsPerLoop = 12,
  bgColor = "#F5D31B",
  inkColor = "#111111",
  emphasisColor = "#6B5EE4",
  fontKey = "anton",
  fontWeight = 800,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const segs = parseSegments(segments, inkColor, emphasisColor);
  const fontFamily = FONTS[fontKey] ?? FONTS.poppins;
  // single-weight display faces look bad faux-bolded — use their natural weight
  const isDisplay = fontKey === "anton" || fontKey === "bebas" || fontKey === "bangers";
  const weight = isDisplay ? 400 : fontWeight;

  const gap = Math.round(width * 0.014);
  const sizePx = (s: Seg) => Math.max(8, Math.round((s.sizeVw / 100) * width));
  const unitH = segs.reduce((sum, s) => sum + sizePx(s) + gap, 0) || height;

  const p = (frame / Math.max(1, secondsPerLoop * fps)) % 1;
  const translateY = -p * unitH;
  const repeats = Math.max(2, Math.ceil(height / unitH) + 2);

  const Unit = (
    <div style={{ width: "100%", textAlign: "center" }}>
      {segs.map((s, i) => (
        <div
          key={i}
          style={{
            fontFamily,
            fontWeight: weight,
            fontStyle: s.italic ? "italic" : "normal",
            fontSize: sizePx(s),
            color: s.color,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            marginBottom: gap,
            whiteSpace: "nowrap",
            textTransform: "none",
          }}
        >
          {s.text}
        </div>
      ))}
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${translateY}px)`, willChange: "transform" }}>
        {Array.from({ length: repeats }).map((_, r) => (
          <React.Fragment key={r}>{Unit}</React.Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};
