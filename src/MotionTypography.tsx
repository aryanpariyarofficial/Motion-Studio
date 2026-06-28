import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS, FontKey } from "./fonts";

export type MotionTypographyProps = {
  segments: string; // one segment per line: "TEXT | sizeVw | color | italic"   (add | focus to mark the zoom target)
  mode?: "reveal" | "loop";
  secondsPerLoop?: number;
  bgColor?: string;
  inkColor?: string;
  emphasisColor?: string;
  fontKey?: FontKey;
  fontWeight?: number;
  durationInSeconds: number;
};

type Seg = { text: string; sizeVw: number; color: string; italic: boolean; focus: boolean };

const SIZES = [10, 3.5, 8, 3.2, 16, 5, 7, 3.5, 11, 4.5];
const DESIGN_W = 1400; // fixed layout width so wrapping is consistent across aspect ratios

const parseSegments = (raw: string, ink: string, accent: string): Seg[] => {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.map((line, i) => {
    const hasPipe = line.includes("|");
    const p = line.split("|").map((s) => s.trim());
    let text = p[0];
    let focus = p.map((x) => x.toLowerCase()).includes("focus");
    if (text.endsWith("*")) { focus = true; text = text.slice(0, -1).trim(); }
    const sizeVw = p[1] && !isNaN(+p[1]) ? +p[1] : SIZES[i % SIZES.length];
    const cRaw = (p[2] || "").toLowerCase();
    let color = ink;
    if (cRaw === "accent") color = accent;
    else if (cRaw.startsWith("#")) color = p[2];
    else if (!hasPipe && i % 3 === 2) color = accent; // auto-accent only for plain word lists
    const italRaw = (p[3] || "").toLowerCase();
    const italic = /italic|true|yes/.test(italRaw) || italRaw === "i" || (!hasPipe && i % 4 === 1);
    return { text, sizeVw, color, italic, focus };
  });
};

export const MotionTypography: React.FC<MotionTypographyProps> = ({
  segments,
  mode = "reveal",
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
  const isDisplay = fontKey === "anton" || fontKey === "bebas" || fontKey === "bangers";
  const weight = isDisplay ? 400 : fontWeight;

  // ---------------- LOOP MODE (continuous vertical scroll) ----------------
  if (mode === "loop") {
    const gap = Math.round(width * 0.014);
    const sizePx = (s: Seg) => Math.max(8, Math.round((s.sizeVw / 100) * width));
    const unitH = segs.reduce((sum, s) => sum + sizePx(s) + gap, 0) || height;
    const p = (frame / Math.max(1, secondsPerLoop * fps)) % 1;
    const translateY = -p * unitH;
    const repeats = Math.max(2, Math.ceil(height / unitH) + 2);
    const Unit = (
      <div style={{ width: "100%", textAlign: "center" }}>
        {segs.map((s, i) => (
          <div key={i} style={{ fontFamily, fontWeight: weight, fontStyle: s.italic ? "italic" : "normal", fontSize: sizePx(s), color: s.color, lineHeight: 1, letterSpacing: "-0.02em", marginBottom: gap, whiteSpace: "nowrap" }}>{s.text}</div>
        ))}
      </div>
    );
    return (
      <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${translateY}px)` }}>
          {Array.from({ length: repeats }).map((_, r) => <React.Fragment key={r}>{Unit}</React.Fragment>)}
        </div>
      </AbsoluteFill>
    );
  }

  // ---------------- REVEAL MODE (zoom from focus word out to whole sentence) ----------------
  const focusIndex = (() => {
    const f = segs.findIndex((s) => s.focus);
    if (f >= 0) return f;
    let bi = 0; for (let i = 1; i < segs.length; i++) if (segs[i].sizeVw > segs[bi].sizeVw) bi = i;
    return bi;
  })();

  const blockRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLSpanElement>(null);
  const [m, setM] = useState<{ bw: number; bh: number; fcx: number; fcy: number; fw: number; fh: number } | null>(null);
  const [handle] = useState(() => delayRender("mt-measure"));
  useLayoutEffect(() => {
    const b = blockRef.current, f = focusRef.current;
    if (b && f) setM({ bw: b.offsetWidth, bh: b.offsetHeight, fcx: f.offsetLeft + f.offsetWidth / 2, fcy: f.offsetTop + f.offsetHeight / 2, fw: f.offsetWidth, fh: f.offsetHeight });
    continueRender(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // camera: start tight on the focus word, ease out to the whole composition
  const p = spring({ frame, fps, config: { damping: 15, mass: 1, stiffness: 85 } }); // 0..~1 with slight overshoot
  let camera: React.CSSProperties = {};
  if (m) {
    const sFit = Math.min((width * 0.9) / m.bw, (height * 0.86) / m.bh);
    const sFocus = Math.min((width * 0.86) / m.fw, (height * 0.78) / m.fh);
    const scale = sFocus + (sFit - sFocus) * p;
    const lookX = m.fcx + (m.bw / 2 - m.fcx) * p;
    const lookY = m.fcy + (m.bh / 2 - m.fcy) * p;
    const tx = width / 2 - scale * lookX;
    const ty = height / 2 - scale * lookY;
    camera = { transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: "0 0" };
  } else {
    camera = { transform: `translate(${width / 2}px, ${height / 2}px) translate(-50%, -50%)` };
  }

  const block = (
    <div ref={blockRef} style={{ position: "relative", width: DESIGN_W, textAlign: "center", lineHeight: 0.95 }}>
      {segs.map((s, i) => (
        <span
          key={i}
          ref={i === focusIndex ? focusRef : undefined}
          style={{
            display: "inline-block",
            fontFamily,
            fontWeight: weight,
            fontStyle: s.italic ? "italic" : "normal",
            fontSize: (s.sizeVw / 100) * DESIGN_W,
            color: s.color,
            letterSpacing: "-0.02em",
            margin: "0 0.12em",
            verticalAlign: "baseline",
          }}
        >
          {s.text}
        </span>
      ))}
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, ...camera }}>{block}</div>
    </AbsoluteFill>
  );
};
