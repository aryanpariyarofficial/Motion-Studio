import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { mukta } from "./fonts";

export type BorderStyle = "box" | "underline" | "dashed" | "none";
export type HeadingStyle = "highlight" | "underline" | "box" | "plain";
export type MarkerStyle = "number" | "check" | "dot" | "none";
export type BgStyle = "grid" | "dots" | "plain" | "gradient";

export type TypingListProps = {
  heading: string;
  items: string;
  marker?: MarkerStyle;
  autoNumber?: boolean; // legacy
  showCaret?: boolean;
  headingStyle?: HeadingStyle;
  borderStyle?: BorderStyle;
  borderWidth?: number;
  cornerRadius?: number;
  itemFill?: boolean;
  activeEmphasis?: boolean;
  backgroundStyle?: BgStyle;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  highlightColor?: string;
  headingColor?: string;
  fontScale?: number;
  fontWeight?: number;
  durationInSeconds: number;
};

const NEP = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
const toNep = (n: number) => String(n).split("").map((d) => NEP[+d]).join("");
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const ListItem: React.FC<{
  prefix: string;
  text: string;
  startFrame: number;
  window: number;
  fontSize: number;
  fontWeight: number;
  textColor: string;
  accentColor: string;
  showCaret: boolean;
  borderStyle: BorderStyle;
  borderWidth: number;
  cornerRadius: number;
  itemFill: boolean;
  activeEmphasis: boolean;
}> = ({ prefix, text, startFrame, window, fontSize, fontWeight, textColor, accentColor, showCaret, borderStyle, borderWidth, cornerRadius, itemFill, activeEmphasis }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const measureRef = useRef<HTMLSpanElement>(null);
  const [fw, setFw] = useState(0);
  const [fh, setFh] = useState(0);

  useLayoutEffect(() => {
    if (measureRef.current) {
      setFw(measureRef.current.offsetWidth);
      setFh(measureRef.current.offsetHeight);
    }
  }, [prefix, text, fontSize, fontWeight]);

  const local = frame - startFrame;
  if (local < 0) return <div style={{ height: fh + fontSize * 0.56, marginBottom: fontSize * 0.55 }} />;

  const appear = interpolate(local, [0, 6], [0, 1], clamp);
  const type = interpolate(local, [3, 3 + window], [0, 1], clamp);
  const isActive = activeEmphasis && type > 0 && type < 1;
  const padX = fontSize * 0.42;
  const padY = fontSize * 0.28;
  const typedW = fw * type;
  const boxW = typedW + padX * 2;
  const boxH = fh + padY * 2;
  const caretOn = showCaret && type < 1 && Math.floor(frame / (fps * 0.35)) % 2 === 0;
  const bw = borderWidth;
  const emphScale = isActive ? 1.04 : 1;

  return (
    <div style={{ opacity: appear, transform: `translateY(${(1 - appear) * 14}px) scale(${emphScale})`, transformOrigin: "left center", marginBottom: fontSize * 0.55 }}>
      <div style={{ position: "relative", display: "inline-block", padding: `${padY}px ${padX}px`, background: itemFill ? `${accentColor}1f` : "transparent", borderRadius: cornerRadius }}>
        <span ref={measureRef} style={{ position: "absolute", visibility: "hidden", whiteSpace: "nowrap", left: 0, top: 0, fontFamily: mukta, fontSize, fontWeight }}>
          {prefix}{text}
        </span>

        <div style={{ overflow: "hidden", width: typedW, whiteSpace: "nowrap" }}>
          {prefix ? <span style={{ fontFamily: mukta, fontSize, fontWeight, color: accentColor }}>{prefix}</span> : null}
          <span style={{ fontFamily: mukta, fontSize, fontWeight, color: isActive ? accentColor : textColor }}>{text}</span>
        </div>

        {caretOn && (
          <span style={{ position: "absolute", left: padX + typedW + 2, top: padY, width: Math.max(2, fontSize * 0.06), height: fh, background: accentColor }} />
        )}

        {borderStyle !== "none" && bw > 0 && (
          <svg width={boxW} height={boxH} viewBox={`0 0 ${boxW} ${boxH}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
            {borderStyle === "underline" ? (
              <line x1={bw / 2} y1={boxH - bw / 2 - 1} x2={boxW - bw / 2} y2={boxH - bw / 2 - 1} stroke={accentColor} strokeWidth={bw} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - type} />
            ) : borderStyle === "dashed" ? (
              <rect x={bw / 2 + 1} y={bw / 2 + 1} width={Math.max(0, boxW - bw - 2)} height={Math.max(0, boxH - bw - 2)} rx={cornerRadius} fill="none" stroke={accentColor} strokeWidth={bw} strokeDasharray={`${bw * 2.5} ${bw * 2}`} opacity={type} />
            ) : (
              <rect x={bw / 2 + 1} y={bw / 2 + 1} width={Math.max(0, boxW - bw - 2)} height={Math.max(0, boxH - bw - 2)} rx={cornerRadius} fill="none" stroke={accentColor} strokeWidth={bw} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - type} />
            )}
          </svg>
        )}
      </div>
    </div>
  );
};

export const TypingList: React.FC<TypingListProps> = ({
  heading,
  items,
  marker = "number",
  autoNumber,
  showCaret = false,
  headingStyle = "highlight",
  borderStyle = "box",
  borderWidth = 3,
  cornerRadius = 10,
  itemFill = false,
  activeEmphasis = false,
  backgroundStyle = "grid",
  bgColor = "#FFFFFF",
  textColor = "#16314A",
  accentColor = "#E8941F",
  highlightColor = "#FFE100",
  headingColor = "#16314A",
  fontScale = 1,
  fontWeight = 700,
}) => {
  const frame = useCurrentFrame();
  const { width, durationInFrames } = useVideoConfig();

  // legacy support: autoNumber=false meant "no numbers"
  const mk: MarkerStyle = autoNumber === false && marker === "number" ? "none" : marker;

  const hasHeading = (heading ?? "").trim().length > 0;
  const lines = items.split("\n").map((l) => l.trim()).filter(Boolean);
  const prefixFor = (i: number) =>
    mk === "number" ? `${toNep(i + 1)}.  ` : mk === "check" ? "✓  " : mk === "dot" ? "●  " : "";

  const headingSize = Math.round(width * 0.058 * fontScale);
  const itemSize = Math.round(width * 0.044 * fontScale);

  const hl = spring({ frame: frame - 2, fps: 30, config: { damping: 200 } });
  const headingOpacity = interpolate(frame, [2, 12], [0, 1], clamp);
  const headingUnderline = spring({ frame: frame - 6, fps: 30, config: { damping: 18, stiffness: 110 } });

  const itemsStart = hasHeading ? 16 : 6;
  const gap = Math.max(20, Math.floor((durationInFrames - itemsStart - 10) / Math.max(1, lines.length)));
  const win = Math.max(12, Math.floor(gap * 0.8));

  // background layer
  const bgLayer = (() => {
    if (backgroundStyle === "plain") return null;
    if (backgroundStyle === "dots")
      return <AbsoluteFill style={{ opacity: 0.5, backgroundImage: `radial-gradient(${textColor}1f 2px, transparent 2.2px)`, backgroundSize: `${width * 0.05}px ${width * 0.05}px` }} />;
    if (backgroundStyle === "gradient")
      return <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 0%, ${accentColor}14, transparent 55%)` }} />;
    return <AbsoluteFill style={{ opacity: 0.5, backgroundImage: `linear-gradient(${textColor}0d 1px, transparent 1px), linear-gradient(90deg, ${textColor}0d 1px, transparent 1px)`, backgroundSize: `${width * 0.06}px ${width * 0.06}px` }} />;
  })();

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden" }}>
      {bgLayer}

      <div style={{ position: "absolute", inset: 0, padding: `${width * 0.08}px ${width * 0.07}px`, display: "flex", flexDirection: "column" }}>
        {hasHeading && (
          <div style={{ alignSelf: "center", marginBottom: width * 0.06, opacity: headingOpacity }}>
            <span style={{ position: "relative", display: "inline-block", padding: `${headingSize * 0.1}px ${headingSize * 0.28}px` }}>
              {headingStyle === "highlight" && (
                <span style={{ position: "absolute", left: 0, top: "12%", bottom: "12%", right: 0, background: highlightColor, transform: `scaleX(${hl})`, transformOrigin: "left center", borderRadius: 4 }} />
              )}
              {headingStyle === "box" && (
                <span style={{ position: "absolute", inset: 0, border: `${Math.max(2, headingSize * 0.05)}px solid ${accentColor}`, borderRadius: 10, opacity: hl }} />
              )}
              <span style={{ position: "relative", fontFamily: mukta, fontWeight: 800, fontSize: headingSize, color: headingColor }}>{heading}</span>
              {headingStyle === "underline" && (
                <span style={{ position: "absolute", left: "6%", right: "6%", bottom: 0, height: Math.max(4, headingSize * 0.08), background: accentColor, borderRadius: 999, transform: `scaleX(${headingUnderline})`, transformOrigin: "left center" }} />
              )}
            </span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          {lines.map((t, i) => (
            <ListItem
              key={i}
              prefix={prefixFor(i)}
              text={t}
              startFrame={itemsStart + i * gap}
              window={win}
              fontSize={itemSize}
              fontWeight={fontWeight}
              textColor={textColor}
              accentColor={accentColor}
              showCaret={showCaret}
              borderStyle={borderStyle}
              borderWidth={borderWidth}
              cornerRadius={cornerRadius}
              itemFill={itemFill}
              activeEmphasis={activeEmphasis}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
