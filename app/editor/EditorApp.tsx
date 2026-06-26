"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Player } from "@remotion/player";
import { CustomScene, Scene, SceneLayer } from "../../src/CustomScene";
import { ASPECTS, AspectKey } from "../../src/studio/templateMeta";

const FPS = 30;
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

const ANIMS = [
  { value: "pop", label: "Pop" },
  { value: "slideUp", label: "Slide up" },
  { value: "fade", label: "Fade" },
  { value: "none", label: "None" },
];
const FONTS_OPTS = [
  { value: "mukta", label: "Mukta (Nepali+EN)" },
  { value: "poppins", label: "Poppins (EN)" },
];

const SCENE_KEY = "motionstudio.scene";

const defaultLayers = (): SceneLayer[] => [
  { id: newId(), type: "text", text: "तपाईंको पाठ", xPct: 50, yPct: 42, sizePct: 9, color: "#FFFFFF", fontKey: "mukta", fontWeight: 800, align: "center", animateIn: "pop", delay: 0 },
  { id: newId(), type: "text", text: "Your subtitle", xPct: 50, yPct: 56, sizePct: 4.5, color: "#E8491F", fontKey: "poppins", fontWeight: 700, align: "center", animateIn: "slideUp", delay: 8 },
];

export default function EditorApp() {
  const [aspect, setAspect] = useState<AspectKey>("vertical");
  const [bg, setBg] = useState("#101826");
  const [transparent, setTransparent] = useState(false);
  const [layers, setLayers] = useState<SceneLayer[]>(defaultLayers);
  const [selId, setSelId] = useState<string>("");
  const [duration, setDuration] = useState(4);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SCENE_KEY);
      if (saved) {
        const s = JSON.parse(saved);
        if (s.layers?.length) {
          setLayers(s.layers);
          setBg(s.bg ?? "#101826");
          setTransparent(!!s.transparent);
          setAspect(s.aspect ?? "vertical");
          setDuration(s.duration ?? 4);
        }
      }
    } catch {}
  }, []);
  useEffect(() => {
    setSelId((id) => id || layers[0]?.id || "");
  }, [layers]);
  useEffect(() => {
    try {
      localStorage.setItem(SCENE_KEY, JSON.stringify({ layers, bg, transparent, aspect, duration }));
    } catch {}
  }, [layers, bg, transparent, aspect, duration]);

  const dims = ASPECTS[aspect];
  const durationInFrames = Math.max(1, Math.round(duration * FPS));
  const scene: Scene = { background: transparent ? "transparent" : bg, layers };
  const sel = layers.find((l) => l.id === selId);

  const updateLayer = (id: string, patch: Partial<SceneLayer>) =>
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const addText = () => {
    const l: SceneLayer = { id: newId(), type: "text", text: "New text", xPct: 50, yPct: 50, sizePct: 7, color: "#FFFFFF", fontKey: "mukta", fontWeight: 800, align: "center", animateIn: "pop", delay: 0 };
    setLayers((ls) => [...ls, l]);
    setSelId(l.id);
  };
  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const l: SceneLayer = { id: newId(), type: "image", src: r.result as string, xPct: 50, yPct: 35, sizePct: 30, animateIn: "pop", delay: 0 };
      setLayers((ls) => [...ls, l]);
      setSelId(l.id);
    };
    r.readAsDataURL(f);
  };
  const removeLayer = (id: string) => setLayers((ls) => ls.filter((l) => l.id !== id));
  const move = (id: string, dir: -1 | 1) =>
    setLayers((ls) => {
      const i = ls.findIndex((l) => l.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= ls.length) return ls;
      const copy = [...ls];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  // fit the canvas into the stage
  const stageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const pad = 24;
      const s = Math.min((el.clientWidth - pad * 2) / dims.w, (el.clientHeight - pad * 2) / dims.h);
      setFit({ w: Math.max(0, Math.floor(dims.w * s)), h: Math.max(0, Math.floor(dims.h * s)) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dims.w, dims.h]);

  // pause on a settled frame so positions match the boxes
  useEffect(() => {
    const settled = Math.min(durationInFrames - 1, Math.max(...layers.map((l) => (l.delay ?? 0) + 25), 25));
    const t = setTimeout(() => {
      try {
        playerRef.current?.pause();
        playerRef.current?.seekTo(settled);
      } catch {}
    }, 60);
    return () => clearTimeout(t);
  }, [layers, durationInFrames, aspect, fit.w]);

  // drag layers on the canvas
  const drag = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const onDown = (e: React.PointerEvent, l: SceneLayer) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id: l.id, sx: e.clientX, sy: e.clientY, ox: l.xPct, oy: l.yPct };
    setSelId(l.id);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !fit.w) return;
    updateLayer(d.id, { xPct: clamp(d.ox + ((e.clientX - d.sx) / fit.w) * 100), yPct: clamp(d.oy + ((e.clientY - d.sy) / fit.h) * 100) });
  };
  const onUp = () => {
    drag.current = null;
  };

  async function exportVideo(format: "mp4" | "mov") {
    setBusy(true);
    setStatus("Rendering… (first export ~20s)");
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compositionId: "CustomScene", inputProps: { scene }, format, width: dims.w, height: dims.h, durationInFrames }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Render failed");
      setStatus(`✅ Saved to out/ — ${String(data.file).split(/[\\/]/).pop()}`);
    } catch (e: any) {
      setStatus(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="brand">
            CUSTOM <span>EDITOR</span>
          </h1>
          <Link href="/" className="link">← back to templates</Link>
        </div>
        <div className="topbar-right">
          <span className="seg-label">Aspect</span>
          <div className="seg">
            {(Object.keys(ASPECTS) as AspectKey[]).map((k) => (
              <button key={k} className={`seg-btn ${aspect === k ? "active" : ""}`} onClick={() => setAspect(k)}>
                {ASPECTS[k].label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="body">
        {/* LEFT: layers */}
        <aside className="sidebar">
          <div className="rail-title">＋ Add layer</div>
          <div className="export-btns" style={{ marginBottom: 16 }}>
            <button className="btn secondary small" onClick={addText}>＋ Text</button>
            <button className="btn secondary small" onClick={() => fileRef.current?.click()}>＋ Image / Logo</button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={addImage} />
          </div>

          <div className="rail-title">Layers</div>
          <ul className="layers">
            {layers.map((l) => (
              <li key={l.id} className={`layer ${l.id === selId ? "sel" : ""}`} onClick={() => setSelId(l.id)}>
                <span className="layer-name">{l.type === "image" ? "🖼 Image" : `🅣 ${l.text || "text"}`}</span>
                <span className="layer-acts">
                  <button onClick={(e) => { e.stopPropagation(); move(l.id, -1); }} title="up">↑</button>
                  <button onClick={(e) => { e.stopPropagation(); move(l.id, 1); }} title="down">↓</button>
                  <button onClick={(e) => { e.stopPropagation(); removeLayer(l.id); }} title="delete">🗑</button>
                </span>
              </li>
            ))}
          </ul>

          <div className="divider" />
          <div className="rail-title">Scene</div>
          <div className="field">
            <label className="check"><input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} /> Transparent background</label>
          </div>
          {!transparent && (
            <div className="field">
              <label>Background color</label>
              <div className="color-row">
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
                <input className="control" value={bg} onChange={(e) => setBg(e.target.value)} />
              </div>
            </div>
          )}
          <div className="field">
            <label>Duration (sec)<span className="slider-val">{duration}</span></label>
            <input type="range" min={1} max={10} step={0.5} value={duration} style={{ width: "100%" }} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
        </aside>

        {/* CENTER: canvas */}
        <main className="stage" ref={stageRef}>
          <div className="player-wrap" style={{ width: fit.w || undefined, height: fit.h || undefined, position: "relative" }}>
            {fit.w > 0 && (
              <>
                <Player
                  key={`${dims.w}x${dims.h}`}
                  ref={playerRef}
                  component={CustomScene as any}
                  inputProps={{ scene }}
                  durationInFrames={durationInFrames}
                  fps={FPS}
                  compositionWidth={dims.w}
                  compositionHeight={dims.h}
                  style={{ width: "100%", height: "100%" }}
                  controls
                />
                {/* drag overlay */}
                <div className="overlay" onPointerMove={onMove} onPointerUp={onUp}>
                  {layers.map((l) => (
                    <button
                      key={l.id}
                      className={`handle ${l.id === selId ? "sel" : ""}`}
                      style={{ left: `${l.xPct}%`, top: `${l.yPct}%` }}
                      onPointerDown={(e) => onDown(e, l)}
                      onPointerMove={onMove}
                      onPointerUp={onUp}
                    >
                      {l.type === "image" ? "🖼" : "🅣"}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="stage-meta">{dims.w}×{dims.h} · drag the handles to position · press ▶ to preview</div>
        </main>

        {/* RIGHT: inspector + export */}
        <aside className="rail">
          <div className="rail-title">Inspector</div>
          {!sel ? (
            <p className="hint">Select a layer to edit it.</p>
          ) : sel.type === "text" ? (
            <>
              <div className="field">
                <label>Text</label>
                <textarea className="control" value={sel.text} onChange={(e) => updateLayer(sel.id, { text: e.target.value })} />
              </div>
              <div className="field">
                <label>Color</label>
                <div className="color-row">
                  <input type="color" value={sel.color} onChange={(e) => updateLayer(sel.id, { color: e.target.value })} />
                  <input className="control" value={sel.color} onChange={(e) => updateLayer(sel.id, { color: e.target.value })} />
                </div>
              </div>
              <Select label="Font" value={sel.fontKey!} opts={FONTS_OPTS} onChange={(v) => updateLayer(sel.id, { fontKey: v as any })} />
              <Slider label="Font size" value={sel.sizePct} min={1} max={24} step={0.5} onChange={(v) => updateLayer(sel.id, { sizePct: v })} />
              <Slider label="Font weight" value={sel.fontWeight ?? 800} min={400} max={900} step={100} onChange={(v) => updateLayer(sel.id, { fontWeight: v })} />
              <Select label="Align" value={sel.align ?? "center"} opts={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} onChange={(v) => updateLayer(sel.id, { align: v as any })} />
            </>
          ) : (
            <Slider label="Image size" value={sel.sizePct} min={5} max={100} step={1} onChange={(v) => updateLayer(sel.id, { sizePct: v })} />
          )}

          {sel && (
            <>
              <Select label="Animation in" value={sel.animateIn ?? "pop"} opts={ANIMS} onChange={(v) => updateLayer(sel.id, { animateIn: v as any })} />
              <Slider label="Delay (frames)" value={sel.delay ?? 0} min={0} max={90} step={1} onChange={(v) => updateLayer(sel.id, { delay: v })} />
              <Slider label="Position X %" value={sel.xPct} min={0} max={100} step={0.5} onChange={(v) => updateLayer(sel.id, { xPct: v })} />
              <Slider label="Position Y %" value={sel.yPct} min={0} max={100} step={0.5} onChange={(v) => updateLayer(sel.id, { yPct: v })} />
            </>
          )}

          <div className="divider" />
          <div className="rail-title">⬇ Export</div>
          <div className="export-btns">
            <button className="btn" disabled={busy} onClick={() => exportVideo("mp4")}>{busy ? "Rendering…" : "Export MP4"}</button>
            <button className="btn secondary" disabled={busy} onClick={() => exportVideo("mov")}>Export transparent .MOV</button>
          </div>
          {status && <div className="status">{status}</div>}
        </aside>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div className="field">
      <label>{label}<span className="slider-val">{value}</span></label>
      <input type="range" min={min} max={max} step={step} value={value} style={{ width: "100%" }} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
function Select({ label, value, opts, onChange }: { label: string; value: string; opts: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select className="control" value={value} onChange={(e) => onChange(e.target.value)}>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
