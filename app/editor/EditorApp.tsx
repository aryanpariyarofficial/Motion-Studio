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
const clampPct = (v: number) => Math.max(0, Math.min(100, v));

const ANIMS = [
  { value: "pop", label: "Pop" }, { value: "slideUp", label: "Slide up" }, { value: "slideDown", label: "Slide down" },
  { value: "slideLeft", label: "Slide left" }, { value: "slideRight", label: "Slide right" }, { value: "fade", label: "Fade" },
  { value: "blurIn", label: "Blur in" }, { value: "zoomIn", label: "Zoom in" }, { value: "rotateIn", label: "Rotate in" }, { value: "none", label: "None" },
];
const OUTS = [{ value: "none", label: "None" }, { value: "fade", label: "Fade out" }, { value: "slideDown", label: "Slide down" }, { value: "zoomOut", label: "Zoom out" }];
const ALIGN = [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }];
const BGTYPES = [{ value: "solid", label: "Solid" }, { value: "gradient", label: "Gradient" }, { value: "image", label: "Image" }, { value: "grid", label: "Grid" }, { value: "dots", label: "Dots" }];
const SCENE_KEY = "motionstudio.scene2";
const KITS_KEY = "motionstudio.kits";
const ACTIVE_KEY = "motionstudio.activeKit";

type Doc = {
  aspect: AspectKey;
  bgType: "solid" | "gradient" | "image" | "grid" | "dots";
  bg: string;
  bgColor2: string;
  bgImage: string | null;
  transparent: boolean;
  duration: number;
  audioSrc: string | null;
  audioName: string;
  audioVolume: number;
  layers: SceneLayer[];
};

const initialDoc = (): Doc => ({
  aspect: "vertical", bgType: "grid", bg: "#101826", bgColor2: "#000000", bgImage: null, transparent: false,
  duration: 4, audioSrc: null, audioName: "", audioVolume: 1,
  layers: [
    { id: newId(), type: "text", text: "तपाईंको पाठ", xPct: 50, yPct: 42, sizePct: 9, rotation: 0, opacity: 1, color: "#FFFFFF", fontKey: "mukta", fontWeight: 800, align: "center", animateIn: "pop", startSec: 0 },
    { id: newId(), type: "text", text: "Your subtitle", xPct: 50, yPct: 56, sizePct: 4.5, rotation: 0, opacity: 1, color: "#E8491F", fontKey: "poppins", fontWeight: 700, align: "center", animateIn: "slideUp", startSec: 0.3 },
  ],
});

export default function EditorApp() {
  const [doc, setDocState] = useState<Doc>(initialDoc);
  const [selId, setSelId] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [sizes, setSizes] = useState<Record<string, { w: number; h: number }>>({});
  const [playFrame, setPlayFrame] = useState(0);
  const [brand, setBrand] = useState<{ logoSrc: string | null; accent: string; primary: string }>({ logoSrc: null, accent: "#E8491F", primary: "#0E3A33" });

  const fileRef = useRef<HTMLInputElement>(null);
  const bgImgRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<any>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const past = useRef<Doc[]>([]);
  const future = useRef<Doc[]>([]);
  const lastT = useRef(0);

  // ---- load brand + saved doc ----
  useEffect(() => {
    try {
      const kits = JSON.parse(localStorage.getItem(KITS_KEY) || "[]");
      const act = localStorage.getItem(ACTIVE_KEY);
      const k = kits.find((x: any) => x.id === act) || kits[0];
      if (k) setBrand({ logoSrc: k.logoSrc ?? null, accent: k.accent ?? "#E8491F", primary: k.primary ?? "#0E3A33" });
    } catch {}
    try {
      const s = localStorage.getItem(SCENE_KEY);
      if (s) { const d = JSON.parse(s); if (d.layers?.length) setDocState({ ...initialDoc(), ...d }); }
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem(SCENE_KEY, JSON.stringify(doc)); } catch {} }, [doc]);
  useEffect(() => setSelId((id) => id || doc.layers[0]?.id || ""), [doc.layers]);

  // ---- history-aware update ----
  const commit = (next: Doc) => {
    setDocState((prev) => {
      const now = Date.now();
      if (now - lastT.current > 500) { past.current.push(prev); if (past.current.length > 60) past.current.shift(); future.current = []; }
      lastT.current = now;
      return next;
    });
  };
  const undo = () => setDocState((prev) => { const p = past.current.pop(); if (!p) return prev; future.current.push(prev); return p; });
  const redo = () => setDocState((prev) => { const f = future.current.pop(); if (!f) return prev; past.current.push(prev); return f; });

  const setDoc = (patch: Partial<Doc>) => commit({ ...doc, ...patch });
  const updateLayer = (id: string, patch: Partial<SceneLayer>) => commit({ ...doc, layers: doc.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  const sel = doc.layers.find((l) => l.id === selId);

  const addLayer = (l: SceneLayer) => { commit({ ...doc, layers: [...doc.layers, l] }); setSelId(l.id); };
  const addText = () => addLayer({ id: newId(), type: "text", text: "New text", xPct: 50, yPct: 50, sizePct: 7, rotation: 0, opacity: 1, color: "#FFFFFF", fontKey: "mukta", fontWeight: 800, align: "center", animateIn: "pop", startSec: 0 });
  const addShape = (shape: "rect" | "ellipse" | "line") => addLayer({ id: newId(), type: "shape", shape, fill: brand.accent, xPct: 50, yPct: 50, sizePct: 30, aspect: shape === "line" ? 0.04 : shape === "ellipse" ? 1 : 0.5, rotation: 0, opacity: 1, animateIn: "pop", startSec: 0 });
  const addImageFromSrc = (src: string) => addLayer({ id: newId(), type: "image", src, xPct: 50, yPct: 35, sizePct: 30, rotation: 0, opacity: 1, animateIn: "pop", startSec: 0 });
  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => addImageFromSrc(r.result as string); r.readAsDataURL(f); };
  const onBgImage = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setDoc({ bgImage: r.result as string, bgType: "image" }); r.readAsDataURL(f); };
  const onAudio = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setDoc({ audioSrc: r.result as string, audioName: f.name }); r.readAsDataURL(f); };

  const removeLayer = (id: string) => commit({ ...doc, layers: doc.layers.filter((l) => l.id !== id) });
  const duplicate = (id: string) => { const l = doc.layers.find((x) => x.id === id); if (!l) return; const c = { ...l, id: newId(), xPct: clampPct(l.xPct + 4), yPct: clampPct(l.yPct + 4) }; commit({ ...doc, layers: [...doc.layers, c] }); setSelId(c.id); };
  const move = (id: string, dir: -1 | 1) => { const i = doc.layers.findIndex((l) => l.id === id); const j = i + dir; if (i < 0 || j < 0 || j >= doc.layers.length) return; const copy = [...doc.layers]; [copy[i], copy[j]] = [copy[j], copy[i]]; commit({ ...doc, layers: copy }); };

  const dims = ASPECTS[doc.aspect];
  const durationInFrames = Math.max(1, Math.round(doc.duration * FPS));
  const scene: Scene = {
    background: doc.transparent ? "transparent" : doc.bg,
    bgType: doc.transparent ? "solid" : doc.bgType,
    bgColor2: doc.bgColor2, bgImage: doc.bgImage,
    layers: doc.layers, audioSrc: doc.audioSrc, audioVolume: doc.audioVolume,
  };

  // ---- fit ----
  const stageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = stageRef.current; if (!el) return;
    const measure = () => {
      const pad = 24; const reserve = 46 + Math.min(doc.layers.length, 6) * 22 + 28;
      const s = Math.min((el.clientWidth - pad * 2) / dims.w, (el.clientHeight - pad * 2 - reserve) / dims.h);
      setFit({ w: Math.max(0, Math.floor(dims.w * s)), h: Math.max(0, Math.floor(dims.h * s)) });
    };
    measure(); const ro = new ResizeObserver(measure); ro.observe(el); return () => ro.disconnect();
  }, [dims.w, dims.h, doc.layers.length]);
  const scale = dims.w ? fit.w / dims.w : 1;

  // pause on settled frame + measure layer sizes
  useEffect(() => {
    const settled = Math.min(durationInFrames - 1, Math.max(...doc.layers.map((l) => Math.round((l.startSec ?? 0) * FPS) + 25), 25));
    const t = setTimeout(() => {
      try { playerRef.current?.pause(); playerRef.current?.seekTo(settled); } catch {}
      const map: Record<string, { w: number; h: number }> = {};
      wrapRef.current?.querySelectorAll<HTMLElement>("[data-layer-id]").forEach((el) => { map[el.getAttribute("data-layer-id")!] = { w: el.offsetWidth, h: el.offsetHeight }; });
      setSizes(map);
    }, 130);
    return () => clearTimeout(t);
  }, [doc.layers, doc.aspect, fit.w, fit.h, selId, durationInFrames]);

  // playhead
  useEffect(() => {
    let raf = 0;
    const loop = () => { try { const f = playerRef.current?.getCurrentFrame?.(); if (typeof f === "number") setPlayFrame(f); } catch {} raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, []);

  // ---- keyboard shortcuts ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (meta && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); return; }
      if (meta && e.key.toLowerCase() === "d") { e.preventDefault(); if (selId) duplicate(selId); return; }
      if ((e.key === "Delete" || e.key === "Backspace") && selId) { e.preventDefault(); removeLayer(selId); return; }
      if (sel && !sel.locked && e.key.startsWith("Arrow")) {
        e.preventDefault(); const step = e.shiftKey ? 2 : 0.5;
        if (e.key === "ArrowLeft") updateLayer(sel.id, { xPct: clampPct(sel.xPct - step) });
        if (e.key === "ArrowRight") updateLayer(sel.id, { xPct: clampPct(sel.xPct + step) });
        if (e.key === "ArrowUp") updateLayer(sel.id, { yPct: clampPct(sel.yPct - step) });
        if (e.key === "ArrowDown") updateLayer(sel.id, { yPct: clampPct(sel.yPct + step) });
      }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [selId, sel, doc]);

  // ---- canvas drag (move / resize / rotate) ----
  const drag = useRef<any>(null);
  const beginMove = (e: React.PointerEvent, l: SceneLayer) => {
    if (l.locked) return; setSelId(l.id);
    drag.current = { mode: "move", id: l.id, sx: e.clientX, sy: e.clientY, ox: l.xPct, oy: l.yPct };
    window.addEventListener("pointermove", onDrag); window.addEventListener("pointerup", endDrag);
  };
  const centerClient = (l: SceneLayer) => {
    const r = wrapRef.current!.getBoundingClientRect();
    return { cx: r.left + (l.xPct / 100) * fit.w, cy: r.top + (l.yPct / 100) * fit.h };
  };
  const beginResize = (e: React.PointerEvent, l: SceneLayer) => {
    e.stopPropagation(); const { cx, cy } = centerClient(l);
    drag.current = { mode: "resize", id: l.id, cx, cy, startDist: Math.hypot(e.clientX - cx, e.clientY - cy) || 1, startSize: l.sizePct };
    window.addEventListener("pointermove", onDrag); window.addEventListener("pointerup", endDrag);
  };
  const beginRotate = (e: React.PointerEvent, l: SceneLayer) => {
    e.stopPropagation(); const { cx, cy } = centerClient(l);
    drag.current = { mode: "rotate", id: l.id, cx, cy, startAngle: Math.atan2(e.clientY - cy, e.clientX - cx), startRot: l.rotation ?? 0 };
    window.addEventListener("pointermove", onDrag); window.addEventListener("pointerup", endDrag);
  };
  const onDrag = (e: PointerEvent) => {
    const d = drag.current; if (!d) return;
    if (d.mode === "move") updateLayer(d.id, { xPct: clampPct(d.ox + ((e.clientX - d.sx) / fit.w) * 100), yPct: clampPct(d.oy + ((e.clientY - d.sy) / fit.h) * 100) });
    else if (d.mode === "resize") { const dist = Math.hypot(e.clientX - d.cx, e.clientY - d.cy); updateLayer(d.id, { sizePct: Math.max(1, d.startSize * (dist / d.startDist)) }); }
    else if (d.mode === "rotate") { const a = Math.atan2(e.clientY - d.cy, e.clientX - d.cx); updateLayer(d.id, { rotation: Math.round(d.startRot + ((a - d.startAngle) * 180) / Math.PI) }); }
  };
  const endDrag = () => { drag.current = null; window.removeEventListener("pointermove", onDrag); window.removeEventListener("pointerup", endDrag); };

  // ---- timeline drag ----
  const tl = useRef<any>(null);
  const beginTl = (e: React.PointerEvent, l: SceneLayer, mode: "move" | "start" | "end") => {
    e.stopPropagation(); setSelId(l.id);
    const track = (e.currentTarget as HTMLElement).closest(".tl-track") as HTMLElement;
    tl.current = { id: l.id, mode, sx: e.clientX, tw: track.offsetWidth, s0: l.startSec ?? 0, e0: l.endSec ?? doc.duration };
    window.addEventListener("pointermove", onTl); window.addEventListener("pointerup", endTl);
  };
  const onTl = (e: PointerEvent) => {
    const d = tl.current; if (!d) return; const dsec = ((e.clientX - d.sx) / d.tw) * doc.duration;
    if (d.mode === "move") { const len = d.e0 - d.s0; let s = Math.max(0, Math.min(doc.duration - len, d.s0 + dsec)); updateLayer(d.id, { startSec: +s.toFixed(2), endSec: +(s + len).toFixed(2) }); }
    else if (d.mode === "start") updateLayer(d.id, { startSec: +Math.max(0, Math.min(d.e0 - 0.1, d.s0 + dsec)).toFixed(2) });
    else updateLayer(d.id, { endSec: +Math.max(d.s0 + 0.1, Math.min(doc.duration, d.e0 + dsec)).toFixed(2) });
  };
  const endTl = () => { tl.current = null; window.removeEventListener("pointermove", onTl); window.removeEventListener("pointerup", endTl); };

  async function exportVideo(format: "mp4" | "mov" | "webm") {
    setBusy(true); setStatus("Rendering… (first export ~20s)");
    try {
      const res = await fetch("/api/render", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ compositionId: "CustomScene", inputProps: { scene }, format, width: dims.w, height: dims.h, durationInFrames }) });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `HTTP ${res.status}`); }
      const blob = await res.blob(); const name = filenameFromResponse(res, `custom.${format}`); downloadBlob(blob, name); setStatus(`⬇ Downloaded ${name}`);
    } catch (e: any) { setStatus(`❌ ${e.message}`); } finally { setBusy(false); }
  }

  // selection geometry
  const selSize = sel ? sizes[sel.id] : undefined;
  const selBox = sel && selSize ? { x: (sel.xPct / 100) * fit.w, y: (sel.yPct / 100) * fit.h, w: selSize.w * scale, h: selSize.h * scale, rot: sel.rotation ?? 0 } : null;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="brand">CUSTOM <span>EDITOR</span></h1>
          <Link href="/" className="link">← templates</Link>
          <button className="mini" onClick={undo} title="Undo (Ctrl+Z)">↶</button>
          <button className="mini" onClick={redo} title="Redo (Ctrl+Shift+Z)">↷</button>
        </div>
        <div className="topbar-right">
          <span className="seg-label">Aspect</span>
          <div className="seg">
            {(Object.keys(ASPECTS) as AspectKey[]).map((k) => (
              <button key={k} className={`seg-btn ${doc.aspect === k ? "active" : ""}`} onClick={() => setDoc({ aspect: k })}>{ASPECTS[k].label}</button>
            ))}
          </div>
        </div>
      </header>

      <div className="body">
        {/* LEFT */}
        <aside className="sidebar">
          <div className="rail-title">＋ Add layer</div>
          <div className="add-grid">
            <button className="btn secondary small" onClick={addText}>🅣 Text</button>
            <button className="btn secondary small" onClick={() => fileRef.current?.click()}>🖼 Image</button>
            <button className="btn secondary small" onClick={() => addShape("rect")}>▭ Rect</button>
            <button className="btn secondary small" onClick={() => addShape("ellipse")}>⬭ Ellipse</button>
            <button className="btn secondary small" onClick={() => addShape("line")}>▬ Line</button>
            {brand.logoSrc && <button className="btn secondary small" onClick={() => addImageFromSrc(brand.logoSrc!)}>🏢 Brand logo</button>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onImage} />

          <div className="rail-title" style={{ marginTop: 16 }}>Layers</div>
          <ul className="layers">
            {[...doc.layers].reverse().map((l) => (
              <li key={l.id} className={`layer ${l.id === selId ? "sel" : ""}`} onClick={() => setSelId(l.id)}>
                <span className="layer-name" style={{ opacity: l.hidden ? 0.4 : 1 }}>{l.type === "image" ? "🖼" : l.type === "shape" ? "▭" : "🅣"} {l.type === "text" ? l.text || "text" : l.type}</span>
                <span className="layer-acts">
                  <button onClick={(e) => { e.stopPropagation(); updateLayer(l.id, { hidden: !l.hidden }); }} title="hide">{l.hidden ? "🚫" : "👁"}</button>
                  <button onClick={(e) => { e.stopPropagation(); updateLayer(l.id, { locked: !l.locked }); }} title="lock">{l.locked ? "🔒" : "🔓"}</button>
                  <button onClick={(e) => { e.stopPropagation(); duplicate(l.id); }} title="duplicate">⧉</button>
                  <button onClick={(e) => { e.stopPropagation(); removeLayer(l.id); }} title="delete">🗑</button>
                </span>
              </li>
            ))}
          </ul>

          <div className="divider" />
          <div className="rail-title">Scene</div>
          <div className="field"><label className="check"><input type="checkbox" checked={doc.transparent} onChange={(e) => setDoc({ transparent: e.target.checked })} /> Transparent background</label></div>
          {!doc.transparent && (
            <>
              <Select label="Background" value={doc.bgType} opts={BGTYPES} onChange={(v) => setDoc({ bgType: v as any })} />
              <Color label={doc.bgType === "gradient" ? "Color 1" : "Background color"} value={doc.bg} onChange={(v) => setDoc({ bg: v })} />
              {doc.bgType === "gradient" && <Color label="Color 2" value={doc.bgColor2} onChange={(v) => setDoc({ bgColor2: v })} />}
              {doc.bgType === "image" && <button className="btn secondary small" onClick={() => bgImgRef.current?.click()}>{doc.bgImage ? "Change image" : "Upload background"}</button>}
              <input ref={bgImgRef} type="file" accept="image/*" hidden onChange={onBgImage} />
            </>
          )}
          <Slider label="Duration (sec)" value={doc.duration} min={1} max={20} step={0.5} onChange={(v) => setDoc({ duration: v })} />
          <div className="field">
            <label>Music / sound</label>
            <div className="row">
              <button className="btn secondary small" onClick={() => audioRef.current?.click()}>{doc.audioSrc ? "Change" : "＋ Add audio"}</button>
              {doc.audioSrc && <button className="btn secondary small" onClick={() => setDoc({ audioSrc: null, audioName: "" })}>Remove</button>}
            </div>
            <input ref={audioRef} type="file" accept="audio/*" hidden onChange={onAudio} />
            {doc.audioSrc && <><p className="hint" style={{ marginBottom: 6 }}>{doc.audioName}</p><Slider label="Volume" value={doc.audioVolume} min={0} max={1} step={0.05} onChange={(v) => setDoc({ audioVolume: v })} /></>}
          </div>
        </aside>

        {/* CENTER */}
        <main className="stage" ref={stageRef}>
          <div className="player-wrap" ref={wrapRef} style={{ width: fit.w || undefined, height: fit.h || undefined, position: "relative" }}>
            {fit.w > 0 && (
              <>
                <Player key={`${dims.w}x${dims.h}`} ref={playerRef} component={CustomScene as any} inputProps={{ scene }} durationInFrames={durationInFrames} fps={FPS} compositionWidth={dims.w} compositionHeight={dims.h} style={{ width: "100%", height: "100%" }} controls />
                {/* interaction overlay */}
                <div className="overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) setSelId(""); }}>
                  {doc.layers.map((l) => {
                    if (l.hidden) return null; const sz = sizes[l.id]; if (!sz) return null;
                    return (
                      <div key={l.id} onPointerDown={(e) => beginMove(e, l)} style={{ position: "absolute", left: `${l.xPct}%`, top: `${l.yPct}%`, width: sz.w * scale, height: sz.h * scale, transform: `translate(-50%,-50%) rotate(${l.rotation ?? 0}deg)`, cursor: l.locked ? "default" : "move", pointerEvents: l.locked ? "none" : "auto" }} />
                    );
                  })}
                  {selBox && !sel?.locked && (
                    <div className="selbox" style={{ left: selBox.x, top: selBox.y, width: selBox.w, height: selBox.h, transform: `translate(-50%,-50%) rotate(${selBox.rot}deg)` }}>
                      <span className="rot-handle" onPointerDown={(e) => beginRotate(e, sel!)} />
                      <span className="rs tl" onPointerDown={(e) => beginResize(e, sel!)} />
                      <span className="rs tr" onPointerDown={(e) => beginResize(e, sel!)} />
                      <span className="rs bl" onPointerDown={(e) => beginResize(e, sel!)} />
                      <span className="rs br" onPointerDown={(e) => beginResize(e, sel!)} />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="stage-meta">{dims.w}×{dims.h} · drag to move · corners resize · top handle rotates · Del / Ctrl+Z / Ctrl+D</div>

          {/* timeline */}
          <div className="timeline">
            {doc.layers.map((l) => {
              const s = (l.startSec ?? 0) / doc.duration; const e = (l.endSec ?? doc.duration) / doc.duration;
              return (
                <div key={l.id} className={`tl-row ${l.id === selId ? "sel" : ""}`} onClick={() => setSelId(l.id)}>
                  <span className="tl-name">{l.type === "image" ? "🖼" : l.type === "shape" ? "▭" : (l.text || "text").slice(0, 12)}</span>
                  <div className="tl-track" onPointerDown={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); const f = Math.round(((e.clientX - r.left) / r.width) * durationInFrames); try { playerRef.current?.pause(); playerRef.current?.seekTo(f); } catch {} }}>
                    <div className="tl-bar" style={{ left: `${s * 100}%`, width: `${Math.max(3, (e - s) * 100)}%` }} onPointerDown={(ev) => beginTl(ev, l, "move")}>
                      <span className="tl-edge l" onPointerDown={(ev) => beginTl(ev, l, "start")} />
                      <span className="tl-edge r" onPointerDown={(ev) => beginTl(ev, l, "end")} />
                    </div>
                    <div className="tl-playhead" style={{ left: `${(playFrame / durationInFrames) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* RIGHT */}
        <aside className="rail">
          <div className="rail-title">Inspector</div>
          {!sel ? <p className="hint">Select a layer (click it on the canvas or in the list).</p> : (
            <>
              {sel.type === "text" && (
                <>
                  <div className="field"><label>Text</label><textarea className="control" value={sel.text} onChange={(e) => updateLayer(sel.id, { text: e.target.value })} /></div>
                  <Color label="Color" value={sel.color || "#fff"} onChange={(v) => updateLayer(sel.id, { color: v })} />
                  <Select label="Font" value={sel.fontKey || "mukta"} opts={FONT_OPTIONS as any} onChange={(v) => updateLayer(sel.id, { fontKey: v as any })} />
                  <Slider label="Font size" value={sel.sizePct} min={1} max={24} step={0.5} onChange={(v) => updateLayer(sel.id, { sizePct: v })} />
                  <Slider label="Font weight" value={sel.fontWeight ?? 800} min={400} max={900} step={100} onChange={(v) => updateLayer(sel.id, { fontWeight: v })} />
                  <Select label="Align" value={sel.align ?? "center"} opts={ALIGN} onChange={(v) => updateLayer(sel.id, { align: v as any })} />
                  <Slider label="Letter spacing" value={sel.letterSpacing ?? 0} min={-5} max={30} step={0.5} onChange={(v) => updateLayer(sel.id, { letterSpacing: v })} />
                  <Slider label="Line height" value={sel.lineHeight ?? 1.15} min={0.8} max={2} step={0.05} onChange={(v) => updateLayer(sel.id, { lineHeight: v })} />
                  <div className="field"><label className="check"><input type="checkbox" checked={!!sel.uppercase} onChange={(e) => updateLayer(sel.id, { uppercase: e.target.checked })} /> UPPERCASE</label></div>
                  <div className="field"><label className="check"><input type="checkbox" checked={!!sel.highlight} onChange={(e) => updateLayer(sel.id, { highlight: e.target.checked })} /> Highlight background</label></div>
                  {sel.highlight && <Color label="Highlight color" value={sel.highlightColor || "#FFE100"} onChange={(v) => updateLayer(sel.id, { highlightColor: v })} />}
                  <Slider label="Outline width" value={sel.stroke ?? 0} min={0} max={8} step={0.5} onChange={(v) => updateLayer(sel.id, { stroke: v })} />
                  {!!sel.stroke && <Color label="Outline color" value={sel.strokeColor || "#000"} onChange={(v) => updateLayer(sel.id, { strokeColor: v })} />}
                </>
              )}
              {sel.type === "shape" && (<><Color label="Fill" value={sel.fill || "#E8491F"} onChange={(v) => updateLayer(sel.id, { fill: v })} /><Slider label="Size" value={sel.sizePct} min={2} max={100} step={1} onChange={(v) => updateLayer(sel.id, { sizePct: v })} /><Slider label="Shape ratio (h/w)" value={sel.aspect ?? 0.5} min={0.02} max={2} step={0.02} onChange={(v) => updateLayer(sel.id, { aspect: v })} /></>)}
              {sel.type === "image" && <Slider label="Image size" value={sel.sizePct} min={5} max={100} step={1} onChange={(v) => updateLayer(sel.id, { sizePct: v })} />}

              <div className="divider" />
              <Slider label="Opacity" value={sel.opacity ?? 1} min={0} max={1} step={0.05} onChange={(v) => updateLayer(sel.id, { opacity: v })} />
              <Select label="Animation in" value={sel.animateIn ?? "pop"} opts={ANIMS} onChange={(v) => updateLayer(sel.id, { animateIn: v as any })} />
              <Select label="Animation out" value={sel.animateOut ?? "none"} opts={OUTS} onChange={(v) => updateLayer(sel.id, { animateOut: v as any })} />
              <div className="field"><label className="check"><input type="checkbox" checked={!!sel.shadow} onChange={(e) => updateLayer(sel.id, { shadow: e.target.checked })} /> Shadow / glow</label></div>
              <Slider label="Rotation°" value={sel.rotation ?? 0} min={-180} max={180} step={1} onChange={(v) => updateLayer(sel.id, { rotation: v })} />
              <Slider label="Start (sec)" value={sel.startSec ?? 0} min={0} max={doc.duration} step={0.1} onChange={(v) => updateLayer(sel.id, { startSec: v })} />
              <Slider label="End (sec)" value={sel.endSec ?? doc.duration} min={0} max={doc.duration} step={0.1} onChange={(v) => updateLayer(sel.id, { endSec: v })} />
              <Slider label="Position X %" value={sel.xPct} min={0} max={100} step={0.5} onChange={(v) => updateLayer(sel.id, { xPct: v })} />
              <Slider label="Position Y %" value={sel.yPct} min={0} max={100} step={0.5} onChange={(v) => updateLayer(sel.id, { yPct: v })} />
            </>
          )}

          <div className="divider" />
          <div className="rail-title">⬇ Export</div>
          <div className="export-btns">
            <button className="btn" disabled={busy} onClick={() => exportVideo("mp4")}>{busy ? "Rendering…" : "Export MP4"}</button>
            <button className="btn secondary" disabled={busy} onClick={() => exportVideo("mov")}>Transparent .MOV</button>
            <button className="btn secondary" disabled={busy} onClick={() => exportVideo("webm")}>Transparent .WebM</button>
          </div>
          {busy && <div className="prog-wrap"><div className="prog"><i style={{ width: "100%" }} /></div></div>}
          {status && <div className="status">{status}</div>}
        </aside>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (<div className="field"><label>{label}<span className="slider-val">{value}</span></label><input type="range" min={min} max={max} step={step} value={value} style={{ width: "100%" }} onChange={(e) => onChange(Number(e.target.value))} /></div>);
}
function Select({ label, value, opts, onChange }: { label: string; value: string; opts: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (<div className="field"><label>{label}</label><select className="control" value={value} onChange={(e) => onChange(e.target.value)}>{opts.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}</select></div>);
}
function Color({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (<div className="field"><label>{label}</label><div className="color-row"><input type="color" value={value} onChange={(e) => onChange(e.target.value)} /><input className="control" value={value} onChange={(e) => onChange(e.target.value)} /></div></div>);
}
