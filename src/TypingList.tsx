import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { mukta } from "./fonts";

export type BorderStyle = "box" | "underline" | "none";

export type TypingListProps = {
  heading: string;
  items: string; // one item per line
  autoNumber?: boolean;
  showCaret?: boolean;
  borderStyle?: BorderStyle;
  borderWidth?: number;
  cornerRadius?: number;
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
}> = ({ text, startFrame, window, fontSize, fontWeight, textColor, accentColor, showCaret, borderStyle, borderWidth, cornerRadius }) => {
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
  }, [text, fontSize, fontWeight]);

  const local = frame - startFrame;
  if (local < 0) return <div style={{ height: fh + fontSize * 0.56, marginBottom: fontSize * 0.55 }} />;

  const appear = interpolate(local, [0, 6], [0, 1], clamp);
  const type = interpolate(local, [3, 3 + window], [0, 1], clamp);
  const padX = fontSize * 0.42;
  const padY = fontSize * 0.28;
  const typedW = fw * type;
  const boxW = typedW + padX * 2;
  const boxH = fh + padY * 2;
  const caretOn = showCaret && type < 1 && Math.floor(frame / (fps * 0.35)) % 2 === 0;
  const bw = borderWidth;

  return (
    <div style={{ opacity: appear, transform: `translateY(${(1 - appear) * 14}px)`, marginBottom: fontSize * 0.55 }}>
      <div style={{ position: "relative", display: "inline-block", padding: `${padY}px ${padX}px` }}>
        {/* hidden full text used only to measure the final width */}
        <span ref={measureRef} style={{ position: "absolute", visibility: "hidden", whiteSpace: "nowrap", left: 0, top: 0, fontFamily: mukta, fontSize, fontWeight }}>
          {text}
        </span>

        {/* visible, clipped (typing) text */}
        <div style={{ overflow: "hidden", width: typedW, whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: mukta, fontSize, fontWeight, color: textColor }}>{text}</span>
        </div>

        {/* optional caret */}
        {caretOn && (
          <span style={{ position: "absolute", left: padX + typedW + 2, top: padY, width: Math.max(2, fontSize * 0.06), height: fh, background: accentColor }} />
        )}

        {/* animated border (draws as the text types) */}
        {borderStyle !== "none" && bw > 0 && (
          <svg width={boxW} height={boxH} viewBox={`0 0 ${boxW} ${boxH}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
            {borderStyle === "box" ? (
              <rect
                x={bw / 2 + 1}
                y={bw / 2 + 1}
                width={Math.max(0, boxW - bw - 2)}
                height={Math.max(0, boxH - bw - 2)}
                rx={cornerRadius}
                fill="none"
                stroke={accentColor}
                strokeWidth={bw}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - type}
              />
            ) : (
              <line
                x1={bw / 2}
                y1={boxH - bw / 2 - 1}
                x2={boxW - bw / 2}
                y2={boxH - bw / 2 - 1}
                stroke={accentColor}
                strokeWidth={bw}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - type}
              />
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
  autoNumber = true,
  showCaret = false,
  borderStyle = "box",
  borderWidth = 3,
  cornerRadius = 10,
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

  const hasHeading = (heading ?? "").trim().length > 0;
  const lines = items.split("\n").map((l) => l.trim()).filter(Boolean);
  const display = lines.map((l, i) => (autoNumber ? `${toNep(i + 1)}. ${l}` : l));

  const headingSize = Math.round(width * 0.058 * fontScale);
  const itemSize = Math.round(width * 0.044 * fontScale);

  const hl = spring({ frame: frame - 2, fps: 30, config: { damping: 200 } });
  const headingOpacity = interpolate(frame, [2, 12], [0, 1], clamp);

  const itemsStart = hasHeading ? 16 : 6;
  const gap = Math.max(20, Math.floor((durationInFrames - itemsStart - 10) / Math.max(1, display.length)));
  const win = Math.max(12, Math.floor(gap * 0.8));

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden" }}>
      {/* faint grid */}
      <AbsoluteFill
        style={{
          opacity: 0.5,
          backgroundImage: `linear-gradient(${textColor}0d 1px, transparent 1px), linear-gradient(90deg, ${textColor}0d 1px, transparent 1px)`,
          backgroundSize: `${width * 0.06}px ${width * 0.06}px`,
        }}
      />

      <div style={{ position: "absolute", inset: 0, padding: `${width * 0.08}px ${width * 0.07}px`, display: "flex", flexDirection: "column" }}>
        {/* heading with highlighter — only when there is heading text */}
        {hasHeading && (
          <div style={{ alignSelf: "center", marginBottom: width * 0.06, opacity: headingOpacity }}>
            <span style={{ position: "relative", display: "inline-block", padding: `${headingSize * 0.08}px ${headingSize * 0.25}px` }}>
              <span style={{ position: "absolute", left: 0, top: "12%", bottom: "12%", right: 0, background: highlightColor, transform: `scaleX(${hl})`, transformOrigin: "left center", borderRadius: 4 }} />
              <span style={{ position: "relative", fontFamily: mukta, fontWeight: 800, fontSize: headingSize, color: headingColor }}>{heading}</span>
            </span>
          </div>
        )}

        {/* list */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          {display.map((t, i) => (
            <ListItem
              key={i}
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
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
