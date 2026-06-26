import React from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "./fonts";

export type SceneLayer = {
  id: string;
  type: "text" | "image";
  text?: string;
  src?: string | null;
  xPct: number; // center X, 0..100
  yPct: number; // center Y, 0..100
  sizePct: number; // text: % of min(w,h) font size · image: % of width
  color?: string;
  fontKey?: keyof typeof FONTS;
  fontWeight?: number;
  align?: "left" | "center" | "right";
  animateIn?: "none" | "fade" | "slideUp" | "pop";
  delay?: number; // frames
};

export type Scene = {
  background: string; // hex or "transparent"
  layers: SceneLayer[];
};

export type CustomSceneProps = { scene: Scene };

export const CustomScene: React.FC<CustomSceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = Math.min(width, height);

  return (
    <AbsoluteFill style={{ backgroundColor: scene.background === "transparent" ? "transparent" : scene.background, overflow: "hidden" }}>
      {scene.layers.map((l) => {
        const local = frame - (l.delay ?? 0);
        let opacity = 1;
        let ty = 0;
        let scale = 1;
        if (l.animateIn === "fade") {
          opacity = interpolate(local, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        } else if (l.animateIn === "slideUp") {
          const s = spring({ frame: local, fps, config: { damping: 200 } });
          opacity = interpolate(local, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          ty = interpolate(s, [0, 1], [base * 0.06, 0]);
        } else if (l.animateIn === "pop") {
          const s = spring({ frame: local, fps, config: { damping: 11, mass: 0.6, stiffness: 160 } });
          opacity = interpolate(local, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          scale = Math.max(0, s);
        }

        const common: React.CSSProperties = {
          position: "absolute",
          left: `${l.xPct}%`,
          top: `${l.yPct}%`,
          transform: `translate(-50%, -50%) translateY(${ty}px) scale(${scale})`,
          opacity,
        };

        if (l.type === "image" && l.src) {
          return <Img key={l.id} src={l.src} style={{ ...common, width: width * (l.sizePct / 100), objectFit: "contain" }} />;
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
              textShadow: "0 4px 18px rgba(0,0,0,0.35)",
            }}
          >
            {l.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
