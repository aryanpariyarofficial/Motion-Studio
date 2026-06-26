import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "./fonts";

export type LayerAnim =
  | "none" | "fade" | "pop" | "slideUp" | "slideDown" | "slideLeft" | "slideRight"
  | "blurIn" | "zoomIn" | "rotateIn";
export type LayerExit = "none" | "fade" | "slideDown" | "zoomOut";
export type LayerType = "text" | "image" | "shape";
export type ShapeKind = "rect" | "ellipse" | "line";

export type SceneLayer = {
  id: string;
  type: LayerType;
  text?: string;
  src?: string | null;
  shape?: ShapeKind;
  fill?: string;
  xPct: number;
  yPct: number;
  sizePct: number;
  aspect?: number; // shapes: height/width
  rotation?: number;
  opacity?: number; // 0..1
  hidden?: boolean;
  locked?: boolean;
  color?: string;
  fontKey?: keyof typeof FONTS;
  fontWeight?: number;
  align?: "left" | "center" | "right";
  letterSpacing?: number;
  lineHeight?: number;
  uppercase?: boolean;
  highlight?: boolean;
  highlightColor?: string;
  stroke?: number;
  strokeColor?: string;
  shadow?: boolean;
  animateIn?: LayerAnim;
  animateOut?: LayerExit;
  startSec?: number;
  endSec?: number;
};

export type Scene = {
  background: string;
  bgType?: "solid" | "gradient" | "image" | "grid" | "dots";
  bgColor2?: string;
  bgImage?: string | null;
  layers: SceneLayer[];
  audioSrc?: string | null;
  audioVolume?: number;
};

export type CustomSceneProps = { scene: Scene };

export const CustomScene: React.FC<CustomSceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = Math.min(width, height);
  const bt = scene.bgType ?? "solid";
  const bg = scene.background;

  return (
    <AbsoluteFill style={{ backgroundColor: bg === "transparent" ? "transparent" : bg, overflow: "hidden" }}>
      {/* scene background variants */}
      {bt === "gradient" && <AbsoluteFill style={{ background: `linear-gradient(135deg, ${bg}, ${scene.bgColor2 ?? "#000000"})` }} />}
      {bt === "image" && scene.bgImage && <Img src={scene.bgImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      {bt === "grid" && <AbsoluteFill style={{ opacity: 0.5, backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: `${width * 0.05}px ${width * 0.05}px` }} />}
      {bt === "dots" && <AbsoluteFill style={{ opacity: 0.5, backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 2px, transparent 2.2px)", backgroundSize: `${width * 0.045}px ${width * 0.045}px` }} />}

      {scene.audioSrc ? <Audio src={scene.audioSrc} volume={scene.audioVolume ?? 1} /> : null}

      {scene.layers.map((l) => {
        if (l.hidden) return null;
        const startFrame = Math.round((l.startSec ?? 0) * fps);
        const endFrame = l.endSec != null ? Math.round(l.endSec * fps) : Infinity;
        if (frame < startFrame || frame > endFrame) return null;
        const local = frame - startFrame;

        let opacity = l.opacity ?? 1;
        let tx = 0, ty = 0, scale = 1, blur = 0;
        let rot = l.rotation ?? 0;
        const anim = l.animateIn ?? "pop";
        const fadeIn = interpolate(local, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const sp = spring({ frame: local, fps, config: { damping: 14, mass: 0.7 } });

        if (anim === "fade") opacity *= fadeIn;
        else if (anim === "pop") { opacity *= interpolate(local, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); scale = Math.max(0, spring({ frame: local, fps, config: { damping: 11, mass: 0.6, stiffness: 160 } })); }
        else if (anim === "slideUp") { opacity *= fadeIn; ty = interpolate(sp, [0, 1], [base * 0.08, 0]); }
        else if (anim === "slideDown") { opacity *= fadeIn; ty = interpolate(sp, [0, 1], [-base * 0.08, 0]); }
        else if (anim === "slideLeft") { opacity *= fadeIn; tx = interpolate(sp, [0, 1], [base * 0.12, 0]); }
        else if (anim === "slideRight") { opacity *= fadeIn; tx = interpolate(sp, [0, 1], [-base * 0.12, 0]); }
        else if (anim === "blurIn") { opacity *= fadeIn; blur = interpolate(local, [0, 14], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); }
        else if (anim === "zoomIn") { opacity *= fadeIn; scale = interpolate(sp, [0, 1], [1.5, 1]); }
        else if (anim === "rotateIn") { opacity *= fadeIn; scale = interpolate(sp, [0, 1], [0.6, 1]); rot += interpolate(sp, [0, 1], [-18, 0]); }

        const outDur = 10;
        if (l.animateOut && l.animateOut !== "none" && endFrame !== Infinity && endFrame - frame < outDur) {
          const exitT = interpolate(endFrame - frame, [0, outDur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          if (l.animateOut === "fade") opacity *= exitT;
          else if (l.animateOut === "slideDown") { opacity *= exitT; ty += (1 - exitT) * base * 0.08; }
          else if (l.animateOut === "zoomOut") { opacity *= exitT; scale *= 0.6 + 0.4 * exitT; }
        }

        const common: React.CSSProperties = {
          position: "absolute",
          left: `${l.xPct}%`,
          top: `${l.yPct}%`,
          transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
          opacity,
        };

        if (l.type === "shape") {
          const w = width * (l.sizePct / 100);
          const h = w * (l.aspect ?? 0.5);
          return (
            <div
              key={l.id}
              data-layer-id={l.id}
              style={{
                ...common,
                width: w,
                height: h,
                background: l.fill ?? "#E8491F",
                borderRadius: l.shape === "ellipse" ? "50%" : l.shape === "line" ? 999 : Math.min(w, h) * 0.08,
                filter: [blur ? `blur(${blur}px)` : "", l.shadow ? "drop-shadow(0 10px 24px rgba(0,0,0,0.4))" : ""].filter(Boolean).join(" ") || undefined,
              }}
            />
          );
        }

        if (l.type === "image" && l.src) {
          const filt = [blur ? `blur(${blur}px)` : "", l.shadow ? "drop-shadow(0 10px 24px rgba(0,0,0,0.45))" : ""].filter(Boolean).join(" ");
          return <Img key={l.id} data-layer-id={l.id} src={l.src} style={{ ...common, width: width * (l.sizePct / 100), objectFit: "contain", filter: filt || undefined }} />;
        }

        const fontSize = base * (l.sizePct / 100);
        return (
          <div
            key={l.id}
            data-layer-id={l.id}
            style={{
              ...common,
              maxWidth: "90%",
              display: "inline-block",
              color: l.color ?? "#FFFFFF",
              fontFamily: FONTS[l.fontKey ?? "mukta"],
              fontWeight: l.fontWeight ?? 800,
              fontSize,
              textAlign: l.align ?? "center",
              lineHeight: l.lineHeight ?? 1.15,
              letterSpacing: l.letterSpacing ?? 0,
              textTransform: l.uppercase ? "uppercase" : "none",
              background: l.highlight ? l.highlightColor ?? "#FFE100" : "transparent",
              padding: l.highlight ? `${fontSize * 0.1}px ${fontSize * 0.25}px` : 0,
              borderRadius: l.highlight ? fontSize * 0.12 : 0,
              WebkitTextStroke: l.stroke ? `${l.stroke}px ${l.strokeColor ?? "#000000"}` : undefined,
              filter: blur ? `blur(${blur}px)` : undefined,
              textShadow: l.shadow ? "0 6px 22px rgba(0,0,0,0.6)" : undefined,
              whiteSpace: "pre-wrap",
            }}
          >
            {l.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
