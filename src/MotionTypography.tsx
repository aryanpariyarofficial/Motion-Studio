import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS, FontKey } from "./fonts";

export type MTMode = "reveal" | "loop";
export type MotionPreset = "smooth" | "snappy" | "bouncy";
export type AccentStyle = "plain" | "highlight" | "box" | "underline";

export type MotionTypographyProps = {
  segments: string;
  mode?: MTMode;
  autoDesign?: boolean;
  direction?: "out" | "in";
  motionPreset?: MotionPreset;
  secondsPerStop?: number;
  exitType?: "none" | "fade" | "zoomIn";
  tilt?: number;
  accentStyle?: AccentStyle;
  bgType?: "solid" | "gradient";
  secondsPerLoop?: number;
  bgColor?: string;
  bgColor2?: string;
  inkColor?: string;
  emphasisColor?: string;
  emphasisColor2?: string;
  fontKey?: FontKey;
  fontWeight?: number;
  durationInSeconds: number;
};

type Seg = { text: string; sizeVw: number; color: string; italic: boolean; focus: boolean; isAccent: boolean };

const SIZES = [10, 3.5, 8, 3.2, 16, 5, 7, 3.5, 11, 4.5];
const DESIGN_W = 1400;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const EASE: Record<MotionPreset, (n: number) => number> = {
  smooth: Easing.bezier(0.45, 0, 0.55, 1),
  snappy: Easing.bezier(0.2, 0.85, 0.2, 1),
  bouncy: Easing.bezier(0.34, 1.5, 0.64, 1),
};

const autoSize = (w: string) => {
  const n = w.replace(/[^\w]/g, "").length;
  return n >= 9 ? 16 : n >= 7 ? 12 : n >= 5 ? 8 : n >= 3 ? 5 : 3.2;
};

const buildSegs = (raw: string, ink: string, accent: string, accent2: string, auto: boolean): Seg[] => {
  if (auto) {
    const words = raw.replace(/\n/g, " ").split(/\s+/).filter(Boolean);
    const lens = words.map((w) => w.replace(/[^\w]/g, "").length);
    const maxLen = Math.max(...lens, 1);
    let acc = 0;
    return words.map((text, i) => {
      const key = lens[i] >= 6;
      let color = ink;
      let isAccent = false;
      if (key) { color = acc % 2 === 0 ? accent : accent2; isAccent = true; acc++; }
      return { text, sizeVw: autoSize(text), color, italic: i % 5 === 3, focus: lens[i] === maxLen, isAccent };
    });
  }
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
    let isAccent = false;
    if (cRaw === "accent") { color = accent; isAccent = true; }
    else if (cRaw === "accent2") { color = accent2; isAccent = true; }
    else if (cRaw.startsWith("#")) color = p[2];
    else if (!hasPipe && i % 3 === 2) { color = accent; isAccent = true; }
    const italRaw = (p[3] || "").toLowerCase();
    const italic = /italic|true|yes/.test(italRaw) || italRaw === "i" || (!hasPipe && i % 4 === 1);
    return { text, sizeVw, color, italic, focus, isAccent };
  });
};

export const MotionTypography: React.FC<MotionTypographyProps> = ({
  segments,
  mode = "reveal",
  autoDesign = false,
  direction = "out",
  motionPreset = "snappy",
  secondsPerStop = 0.7,
  exitType = "none",
  tilt = 0,
  accentStyle = "plain",
  bgType = "solid",
  secondsPerLoop = 12,
  bgColor = "#F5D31B",
  bgColor2 = "#FF7A00",
  inkColor = "#111111",
  emphasisColor = "#6B5EE4",
  emphasisColor2 = "#E8491F",
  fontKey = "anton",
  fontWeight = 800,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // ---- all hooks must run every render (never conditionally) ----
  const blockRef = useRef<HTMLDivElement>(null);
  const [m, setM] = useState<{ bw: number; bh: number; rects: { cx: number; cy: number; w: number; h: number }[] } | null>(null);
  const [handle] = useState(() => delayRender("mt-measure"));
  const measure = () => {
    const b = blockRef.current;
    if (!b) return;
    const rects: { cx: number; cy: number; w: number; h: number }[] = [];
    b.querySelectorAll<HTMLElement>("[data-i]").forEach((el) => {
      const idx = +el.getAttribute("data-i")!;
      rects[idx] = { cx: el.offsetLeft + el.offsetWidth / 2, cy: el.offsetTop + el.offsetHeight / 2, w: el.offsetWidth, h: el.offsetHeight };
    });
    setM({ bw: b.offsetWidth, bh: b.offsetHeight, rects });
  };
  useLayoutEffect(() => {
    measure();
    continueRender(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments, autoDesign, mode, width, height, fontKey, fontWeight, accentStyle]);

  const segs = buildSegs(segments, inkColor, emphasisColor, emphasisColor2, autoDesign);
  const fontFamily = FONTS[fontKey] ?? FONTS.poppins;
  const isDisplay = fontKey === "anton" || fontKey === "bebas" || fontKey === "bangers";
  const weight = isDisplay ? 400 : fontWeight;

  const bgFill = bgType === "gradient" ? `linear-gradient(135deg, ${bgColor}, ${bgColor2})` : bgColor;

  // ---------------- LOOP MODE ----------------
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
      <AbsoluteFill style={{ background: bgFill, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${translateY}px)` }}>
          {Array.from({ length: repeats }).map((_, r) => <React.Fragment key={r}>{Unit}</React.Fragment>)}
        </div>
      </AbsoluteFill>
    );
  }

  // ---------------- REVEAL MODE (multi-stop camera) ----------------
  const block = (
    <div ref={blockRef} style={{ position: "relative", width: DESIGN_W, textAlign: "center", lineHeight: 0.95 }}>
      {segs.map((s, i) => {
        const fs = (s.sizeVw / 100) * DESIGN_W;
        const chip = s.isAccent && accentStyle !== "plain";
        const base: React.CSSProperties = {
          display: "inline-block", fontFamily, fontWeight: weight, fontStyle: s.italic ? "italic" : "normal",
          fontSize: fs, color: s.color, letterSpacing: "-0.02em", margin: "0 0.12em", verticalAlign: "baseline",
        };
        if (chip && accentStyle === "highlight") { base.background = s.color; base.color = bgColor; base.padding = "0 0.12em"; base.borderRadius = fs * 0.08; }
        if (chip && accentStyle === "box") { base.border = `${Math.max(2, fs * 0.04)}px solid ${s.color}`; base.padding = "0 0.1em"; base.borderRadius = fs * 0.08; }
        if (chip && accentStyle === "underline") { base.borderBottom = `${Math.max(3, fs * 0.06)}px solid ${s.color}`; }
        return <span key={i} data-i={i} style={base}>{s.text}</span>;
      })}
    </div>
  );

  // build the camera path (list of "views")
  let camera: React.CSSProperties = { transform: `translate(${width / 2}px, ${height / 2}px) translate(-50%, -50%)` };
  let tiltDeg = 0;
  let punchMul = 1;
  if (m) {
    const sFit = Math.min((width * 0.9) / m.bw, (height * 0.86) / m.bh);
    const viewFull = { scale: sFit, lx: m.bw / 2, ly: m.bh / 2, word: false };
    const viewWord = (i: number) => {
      const r = m.rects[i] || { cx: m.bw / 2, cy: m.bh / 2, w: m.bw, h: m.bh };
      const s = Math.min(Math.min((width * 0.86) / r.w, (height * 0.78) / r.h), sFit * 7);
      return { scale: s, lx: r.cx, ly: r.cy, word: true };
    };
    let stops = segs.map((s, i) => (s.focus ? i : -1)).filter((i) => i >= 0);
    if (!stops.length) { let bi = 0; segs.forEach((s, i) => { if (s.sizeVw > segs[bi].sizeVw) bi = i; }); stops = [bi]; }
    let nodes = [...stops.map(viewWord), viewFull];
    if (direction === "in") nodes = nodes.reverse();

    const transitions = Math.max(1, nodes.length - 1);
    const rawIdx = frame / fps / Math.max(0.1, secondsPerStop);
    let idx = Math.floor(rawIdx);
    let local = rawIdx - idx;
    if (idx >= transitions) { idx = transitions - 1; local = 1; }
    const A = nodes[idx];
    const B = nodes[idx + 1];
    const e = EASE[motionPreset](local);
    const scale = lerp(A.scale, B.scale, e);
    const lx = lerp(A.lx, B.lx, e);
    const ly = lerp(A.ly, B.ly, e);
    const tx = width / 2 - scale * lx;
    const ty = height / 2 - scale * ly;
    camera = { transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: "0 0" };

    // tilt peaks mid-transition, alternating direction
    tiltDeg = Math.sin(e * Math.PI) * tilt * (idx % 2 === 0 ? 1 : -1);
    // punch when just arriving at a word node
    if (A.word && local < 0.16) punchMul = 1 + (1 - local / 0.16) * 0.05;
  }

  // exit animation in the final frames
  let exitScale = 1, exitOpacity = 1;
  if (exitType !== "none") {
    const eT = interpolate(durationInFrames - frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (exitType === "fade") exitOpacity = eT;
    else if (exitType === "zoomIn") { exitOpacity = eT; exitScale = 1 + (1 - eT) * 0.5; }
  }

  return (
    <AbsoluteFill style={{ background: bgFill, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `rotate(${tiltDeg}deg) scale(${exitScale * punchMul})`, transformOrigin: "center", opacity: exitOpacity }}>
        <div style={{ position: "absolute", top: 0, left: 0, ...camera }}>{block}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
