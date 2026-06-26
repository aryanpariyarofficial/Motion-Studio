import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "./fonts";

export type LayerAnim =
  | "none"
  | "fade"
  | "pop"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "blurIn"
  | "zoomIn"
  | "rotateIn";

export type SceneLayer = {
  id: string;
  type: "text" | "image";
  text?: string;
  src?: string | null;
  xPct: number;
  yPct: number;
  sizePct: number;
  rotation?: number; // degrees
  color?: string;
  fontKey?: keyof typeof FONTS;
  fontWeight?: number;
  align?: "left" | "center" | "right";
  animateIn?: LayerAnim;
  animateOut?: "none" | "fade" | "slideDown" | "zoomOut";
  shadow?: boolean;
  startSec?: number; // when the layer appears
  endSec?: number; // when it disappears (default: end of scene)
};

export type Scene = {
  background: string;
  layers: SceneLayer[];
  audioSrc?: string | null;
  audioVolume?: number;
};

export type CustomSceneProps = { scene: Scene };

export const CustomScene: React.FC<CustomSceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = Math.min(width, height);

  return (
    <AbsoluteFill style={{ backgroundColor: scene.background === "transparent" ? "transparent" : scene.background, overflow: "hidden" }}>
      {scene.audioSrc ? <Audio src={scene.audioSrc} volume={scene.audioVolume ?? 1} /> : null}

      {scene.layers.map((l) => {
        const startFrame = Math.round((l.startSec ?? 0) * fps);
        const endFrame = l.endSec != null ? Math.round(l.endSec * fps) : Infinity;
        if (frame < startFrame || frame > endFrame) return null;
        const local = frame - startFrame;

        let opacity = 1;
        let tx = 0;
        let ty = 0;
        let scale = 1;
        let rot = l.rotation ?? 0;
        let blur = 0;
        const anim = l.animateIn ?? "pop";
        const fadeIn = interpolate(local, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const sp = spring({ frame: local, fps, config: { damping: 14, mass: 0.7 } });

        if (anim === "fade") opacity = fadeIn;
        else if (anim === "pop") { opacity = interpolate(local, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); scale = Math.max(0, spring({ frame: local, fps, config: { damping: 11, mass: 0.6, stiffness: 160 } })); }
        else if (anim === "slideUp") { opacity = fadeIn; ty = interpolate(sp, [0, 1], [base * 0.08, 0]); }
        else if (anim === "slideDown") { opacity = fadeIn; ty = interpolate(sp, [0, 1], [-base * 0.08, 0]); }
        else if (anim === "slideLeft") { opacity = fadeIn; tx = interpolate(sp, [0, 1], [base * 0.12, 0]); }
        else if (anim === "slideRight") { opacity = fadeIn; tx = interpolate(sp, [0, 1], [-base * 0.12, 0]); }
        else if (anim === "blurIn") { opacity = fadeIn; blur = interpolate(local, [0, 14], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); }
        else if (anim === "zoomIn") { opacity = fadeIn; scale = interpolate(sp, [0, 1], [1.5, 1]); }
        else if (anim === "rotateIn") { opacity = fadeIn; scale = interpolate(sp, [0, 1], [0.6, 1]); rot += interpolate(sp, [0, 1], [-18, 0]); }

        // exit animation in the last frames before endFrame
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

        if (l.type === "image" && l.src) {
          const filt = [blur ? `blur(${blur}px)` : "", l.shadow ? "drop-shadow(0 10px 24px rgba(0,0,0,0.45))" : ""].filter(Boolean).join(" ");
          return <Img key={l.id} src={l.src} style={{ ...common, width: width * (l.sizePct / 100), objectFit: "contain", filter: filt || undefined }} />;
        }
        return (
          <div
            key={l.id}
            style={{
              ...common,
              width: "86%",
              color: l.color ?? "#FFFFFF",
              fontFamily: FONTS[l.fontKey ?? "mukta"],
              fontWeight: l.fontWeight ?? 800,
              fontSize: base * (l.sizePct / 100),
              textAlign: l.align ?? "center",
              lineHeight: 1.15,
              filter: blur ? `blur(${blur}px)` : undefined,
              textShadow: l.shadow ? "0 6px 22px rgba(0,0,0,0.6)" : "0 4px 18px rgba(0,0,0,0.35)",
            }}
          >
            {l.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
