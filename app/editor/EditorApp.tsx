"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { Player } from "@remotion/player";
import { CustomScene, Scene, SceneLayer } from "../../src/CustomScene";
import { ASPECTS, AspectKey } from "../../src/studio/templateMeta";
import { FONT_OPTIONS } from "../../src/fonts";
import { downloadBlob, filenameFromResponse } from "../../src/studio/download";

const FPS = 30;
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

const ANIMS = [
  { value: "pop", label: "Pop" },
  { value: "slideUp", label: "Slide up" },
  { value: "slideDown", label: "Slide down" },
  { value: "slideLeft", label: "Slide left" },
  { value: "slideRight", label: "Slide right" },
  { value: "fade", label: "Fade" },
  { value: "blurIn", label: "Blur in" },
  { value: "zoomIn", label: "Zoom in" },
  { value: "rotateIn", label: "Rotate in" },
  { value: "none", label: "None" },
];
const FONTS_OPTS = FONT_OPTIONS;
const OUTS = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade out" },
  { value: "slideDown", label: "Slide down" },
  { value: "zoomOut", label: "Zoom out" },
];
const SCENE_KEY = "motionstudio.scene";

const defaultLayers = (): SceneLayer[] => [
  { id: newId(), type: "text", text: "तपाईंको पाठ", xPct: 50, yPct: 42, sizePct: 9, rotation: 0, color: "#FFFFFF", fontKey: "mukta", fontWeight: 800, align: "center", animateIn: "pop", startSec: 0 },
  { id: newId(), type: "text", text: "Your subtitle", xPct: 50, yPct: 56, sizePct: 4.5, rotation: 0, color: "#E8491F", fontKey: "poppins", fontWeight: 700, align: "center", animateIn: "slideUp", startSec: 0.3 },
];

export default function EditorApp() {
  const [aspect, setAspect] = useState<AspectKey>("vertical");
  const [bg, setBg] = useState("#101826");
  const [transparent, setTransparent] = useState(false);
  const [layers, setLayers] = useState<SceneLayer[]>(defaultLayers);
  const [selId, setSelId] = useState<string>("");
  const [duration, setDuration] = useState(4);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>("");
  const [audioVolume, setAudioVolume] = useState(1);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
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
          setAudioSrc(s.audioSrc ?? null);
          setAudioName(s.audioName ?? "");
          setAudioVolume(s.audioVolume ?? 1);
        }
      }
    } catch {}
  }, []);
  useEffect(() => setSelId((id) => id || layers[0]?.id || ""), [layers]);
  useEffect(() => {
    try {
      localStorage.setItem(SCENE_KEY, JSON.stringify({ layers, bg, transparent, aspect, duration, audioSrc, audioName, audioVolume }));
    } catch {}
  }, [layers, bg, transparent, aspect, duration, audioSrc, audioName, audioVolume]);

  const dims = ASPECTS[aspect];
  const durationInFrames = Math.max(1, Math.round(duration * FPS));
  const scene: Scene = { background: transparent ? "transparent" : bg, layers, audioSrc, audioVolume };
  const sel = layers.find((l) => l.id === selId);

  const updateLayer = (id: string, patch: Partial<SceneLayer>) =>
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const addText = () => {
    const l: SceneLayer = { id: newId(), type: "text", text: "New text", xPct: 50, yPct: 50, sizePct: 7, rotation: 0, color: "#FFFFFF", fontKey: "mukta", fontWeight: 800, align: "center", animateIn: "pop", startSec: 0 };
    setLayers((ls) => [...ls, l]);
    setSelId(l.id);
  };
  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const l: SceneLayer = { id: newId(), type: "image", src: r.result as string, xPct: 50, yPct: 35, sizePct: 30, rotation: 0, animateIn: "pop", startSec: 0 };
      setLayers((ls) => [...ls, l]);
      setSelId(l.id);
    };
    r.readAsDataURL(f);
  };
  const onAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setAudioSrc(r.result as string); setAudioName(f.name); };
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

  const stageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const pad = 24;
      const reserve = 46 + Math.min(layers.length, 6) * 22 + 24; // meta + timeline rows
      const availW = el.clientWidth - pad * 2;
      const availH = el.clientHeight - pad * 2 - reserve;
      const s = Math.min(availW / dims.w, availH / dims.h);
      setFit({ w: Math.max(0, Math.floor(dims.w * s)), h: Math.max(0, Math.floor(dims.h * s)) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dims.w, dims.h, layers.length]);

  useEffect(() => {
    const settled = Math.min(durationInFrames - 1, Math.max(...layers.map((l) => Math.round((l.startSec ?? 0) * FPS) + 25), 25));
    const t = setTimeout(() => {
      try { playerRef.current?.pause(); playerRef.current?.seekTo(settled); } catch {}
    }, 60);
    return () => clearTimeout(t);
  }, [layers, durationInFrames, aspect, fit.w]);

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
  const onUp = () => { drag.current = null; };

  async function exportVideo(format: "mp4" | "mov" | "webm") {
    setBusy(true);
    setStatus("Rendering… (first export ~20s)");
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compositionId: "CustomScene", inputProps: { scene }, format, width: dims.w, height: dims.h, durationInFrames }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `HTTP ${res.status}`); }
      const blob = await res.blob();
      const name = filenameFromResponse(res, `custom.${format}`);
      downloadBlob(blob, name);
      setStatus(`⬇ Downloaded ${name}`);
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
          <h1 className="brand">CUSTOM <span>EDITOR</span></h1>
          <Link href="/" className="link">← back to templates</Link>
        </div>
        <div className="topbar-right">
          <span className="seg-label">Aspect</span>
          <div className="seg">
            {(Object.keys(ASPECTS) as AspectKey[]).map((k) => (
              <button key={k} className={`seg-btn ${aspect === k ? "active" : ""}`} onClick={() => setAspect(k)}>{ASPECTS[k].label}</button>
            ))}
          </div>
        </div>
      </header>

      <div className="body">
        {/* LEFT */}
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
                  <button onClick={(e) => { e.stopPropagation(); move(l.id, -1); }}>↑</button>
                  <button onClick={(e) => { e.stopPropagation(); move(l.id, 1); }}>↓</button>
                  <button onClick={(e) => { e.stopPropagation(); removeLayer(l.id); }}>🗑</button>
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
            <input type="range" min={1} max={15} step={0.5} value={duration} style={{ width: "100%" }} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>

          <div className="field">
            <label>Music / sound</label>
            <div className="row">
              <button className="btn secondary small" onClick={() => audioRef.current?.click()}>{audioSrc ? "Change" : "＋ Add audio"}</button>
              {audioSrc && <button className="btn secondary small" onClick={() => { setAudioSrc(null); setAudioName(""); }}>Remove</button>}
            </div>
            <input ref={audioRef} type="file" accept="audio/*" hidden onChange={onAudio} />
            {audioSrc && (
              <>
                <p className="hint" style={{ marginBottom: 6 }}>{audioName}</p>
                <label>Volume<span className="slider-val">{audioVolume}</span></label>
                <input type="range" min={0} max={1} step={0.05} value={audioVolume} style={{ width: "100%" }} onChange={(e) => setAudioVolume(Number(e.target.value))} />
              </>
            )}
          </div>
        </aside>

        {/* CENTER */}
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
                <div className="overlay" onPointerMove={onMove} onPointerUp={onUp}>
                  {layers.map((l) => (
                    <button key={l.id} className={`handle ${l.id === selId ? "sel" : ""}`} style={{ left: `${l.xPct}%`, top: `${l.yPct}%` }} onPointerDown={(e) => onDown(e, l)} onPointerMove={onMove} onPointerUp={onUp}>
                      {l.type === "image" ? "🖼" : "🅣"}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="stage-meta">{dims.w}×{dims.h} · drag handles to position · press ▶ to preview</div>

          {/* timeline */}
          <div className="timeline">
            {layers.map((l) => {
              const s = (l.startSec ?? 0) / duration;
              const e = (l.endSec ?? duration) / duration;
              return (
                <div key={l.id} className={`tl-row ${l.id === selId ? "sel" : ""}`} onClick={() => setSelId(l.id)}>
                  <span className="tl-name">{l.type === "image" ? "🖼" : (l.text || "text").slice(0, 14)}</span>
                  <div className="tl-track">
                    <div className="tl-bar" style={{ left: `${s * 100}%`, width: `${Math.max(2, (e - s) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* RIGHT */}
        <aside className="rail">
          <div className="rail-title">Inspector</div>
          {!sel ? (
            <p className="hint">Select a layer to edit it.</p>
          ) : (
            <>
              {sel.type === "text" ? (
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

              <Select label="Animation in" value={sel.animateIn ?? "pop"} opts={ANIMS} onChange={(v) => updateLayer(sel.id, { animateIn: v as any })} />
              <Select label="Animation out" value={sel.animateOut ?? "none"} opts={OUTS} onChange={(v) => updateLayer(sel.id, { animateOut: v as any })} />
              <div className="field">
                <label className="check"><input type="checkbox" checked={!!sel.shadow} onChange={(e) => updateLayer(sel.id, { shadow: e.target.checked })} /> Shadow / glow</label>
              </div>
              <Slider label="Rotation°" value={sel.rotation ?? 0} min={-180} max={180} step={1} onChange={(v) => updateLayer(sel.id, { rotation: v })} />
              <Slider label="Start (sec)" value={sel.startSec ?? 0} min={0} max={duration} step={0.1} onChange={(v) => updateLayer(sel.id, { startSec: v })} />
              <Slider label="End (sec)" value={sel.endSec ?? duration} min={0} max={duration} step={0.1} onChange={(v) => updateLayer(sel.id, { endSec: v })} />
              <Slider label="Position X %" value={sel.xPct} min={0} max={100} step={0.5} onChange={(v) => updateLayer(sel.id, { xPct: v })} />
              <Slider label="Position Y %" value={sel.yPct} min={0} max={100} step={0.5} onChange={(v) => updateLayer(sel.id, { yPct: v })} />
            </>
          )}

          <div className="divider" />
          <div className="rail-title">⬇ Export</div>
          <div className="export-btns">
            <button className="btn" disabled={busy} onClick={() => exportVideo("mp4")}>{busy ? "Rendering…" : "Export MP4"}</button>
            <button className="btn secondary" disabled={busy} onClick={() => exportVideo("mov")}>Transparent .MOV (CapCut)</button>
            <button className="btn secondary" disabled={busy} onClick={() => exportVideo("webm")}>Transparent .WebM (anywhere)</button>
          </div>
          <p className="hint">Downloads to your browser's Downloads folder.</p>
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
        {opts.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </div>
  );
}
