"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Player } from "@remotion/player";
import { COMPONENTS } from "../src/studio/registry";
import {
  ASPECTS,
  AspectKey,
  Brand,
  buildComposition,
  Control,
  DEFAULT_BRAND,
  getTemplate,
  TEMPLATES,
} from "../src/studio/templateMeta";

type PropsMap = Record<string, Record<string, unknown>>;

const initialProps: PropsMap = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, { ...t.defaultProps }]),
);

const BRAND_KEY = "motionstudio.brand";

export default function StudioApp() {
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [aspect, setAspect] = useState<AspectKey>("horizontal");
  const [allProps, setAllProps] = useState<PropsMap>(initialProps);
  const [brand, setBrand] = useState<Brand>(DEFAULT_BRAND);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err" | "info"; msg: string } | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<any>(null);

  // expose the player for screenshot tooling (harmless in normal use)
  useEffect(() => {
    if (typeof window !== "undefined") (window as any).__player = playerRef.current;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BRAND_KEY);
      if (saved) setBrand({ ...DEFAULT_BRAND, ...JSON.parse(saved) });
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(BRAND_KEY, JSON.stringify(brand));
    } catch {}
  }, [brand]);

  const meta = getTemplate(templateId)!;
  const props = allProps[templateId];

  const setProp = (key: string, value: unknown) =>
    setAllProps((prev) => ({ ...prev, [templateId]: { ...prev[templateId], [key]: value } }));
  const setBrandField = (key: keyof Brand, value: unknown) =>
    setBrand((b) => ({ ...b, [key]: value }));

  const comp = useMemo(
    () => buildComposition(templateId, props, aspect, brand),
    [templateId, props, aspect, brand],
  );
  const Component = COMPONENTS[meta.compositionId];

  // fit the preview inside the available stage area (no page scrolling)
  const stageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const pad = 28;
      const metaH = 40;
      const availW = el.clientWidth - pad * 2;
      const availH = el.clientHeight - pad * 2 - metaH;
      const s = Math.min(availW / comp.width, availH / comp.height);
      setFit({ w: Math.max(0, Math.floor(comp.width * s)), h: Math.max(0, Math.floor(comp.height * s)) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [comp.width, comp.height]);

  function onLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setBrandField("logoSrc", reader.result as string);
    reader.readAsDataURL(f);
  }

  async function exportVideo(format: "mp4" | "mov") {
    setBusy(true);
    setStatus({ kind: "info", msg: "Rendering… first export bundles the project (~20s), later ones are fast." });
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          inputProps: comp.inputProps,
          format,
          width: comp.width,
          height: comp.height,
          durationInFrames: comp.durationInFrames,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Render failed");
      setStatus({ kind: "ok", msg: `✅ Saved to out/` });
      setRecent((r) => [data.file, ...r].slice(0, 6));
    } catch (e: any) {
      setStatus({ kind: "err", msg: `❌ ${e.message}` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app">
      {/* ---------------- TOP BAR ---------------- */}
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="brand">
            MOTION <span>STUDIO</span>
          </h1>
          <span className="sub">Animated text & brand assets for your video ads</span>
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
        {/* ---------------- LEFT SIDEBAR ---------------- */}
        <aside className="sidebar">
          <div className="kit">
            <div className="kit-title">🎨 Brand Kit</div>
            <div className="field">
              <label>Brand name</label>
              <input className="control" value={brand.name} onChange={(e) => setBrandField("name", e.target.value)} />
            </div>
            <div className="field">
              <label>Logo</label>
              <div className="logo-row">
                <div className="logo-prev">
                  {brand.logoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brand.logoSrc} alt="logo" />
                  ) : (
                    <span>No logo</span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button className="btn secondary small" onClick={() => fileRef.current?.click()}>
                    Upload logo
                  </button>
                  {brand.logoSrc && (
                    <button className="btn secondary small" onClick={() => setBrandField("logoSrc", null)}>
                      Remove
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onLogoUpload} />
              </div>
              <p className="hint">PNG with transparency works best. Shows in the Logo + Contact Card.</p>
            </div>
            <div className="field" style={{ marginBottom: 4 }}>
              <label>Brand colors</label>
              <div className="row">
                <ColorPick label="Primary" value={brand.primary} onChange={(v) => setBrandField("primary", v)} />
                <ColorPick label="Accent" value={brand.accent} onChange={(v) => setBrandField("accent", v)} />
              </div>
            </div>
          </div>

          <div className="field">
            <label>Template</label>
            <select
              className="control"
              value={templateId}
              onChange={(e) => {
                setTemplateId(e.target.value);
                setStatus(null);
              }}
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="hint">{meta.description}</p>
          </div>

          <div className="divider" />

          {meta.controls.map((c) => (
            <ControlField key={c.key} control={c} value={props[c.key]} onChange={(v) => setProp(c.key, v)} />
          ))}
        </aside>

        {/* ---------------- CENTER STAGE ---------------- */}
        <main className="stage" ref={stageRef}>
          <div className="player-wrap" style={{ width: fit.w || undefined, height: fit.h || undefined }}>
            {fit.w > 0 && (
              <Player
                key={`${comp.width}x${comp.height}`}
                ref={playerRef}
                component={Component}
                inputProps={comp.inputProps}
                durationInFrames={comp.durationInFrames}
                fps={comp.fps}
                compositionWidth={comp.width}
                compositionHeight={comp.height}
                style={{ width: "100%", height: "100%" }}
                controls
                loop
                autoPlay
              />
            )}
          </div>
          <div className="stage-meta">
            {meta.label} · {comp.width}×{comp.height} · {comp.fps}fps · {(comp.durationInFrames / comp.fps).toFixed(1)}s
          </div>
        </main>

        {/* ---------------- RIGHT RAIL ---------------- */}
        <aside className="rail">
          <div className="rail-title">⬇ Export</div>
          <div className="export-btns">
            <button className="btn" disabled={busy} onClick={() => exportVideo("mp4")}>
              {busy ? "Rendering…" : "Export MP4"}
            </button>
            <button className="btn secondary" disabled={busy} onClick={() => exportVideo("mov")}>
              Export transparent .MOV
            </button>
          </div>
          <p className="hint">MP4 = solid background · MOV = transparent overlay for CapCut.</p>
          {status && <div className={`status ${status.kind === "info" ? "" : status.kind}`}>{status.msg}</div>}

          {recent.length > 0 && (
            <>
              <div className="divider" />
              <div className="rail-title">🗂 Recent renders</div>
              <ul className="recent">
                {recent.map((f, i) => (
                  <li key={i} title={f}>
                    {f.split(/[\\/]/).pop()}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="divider" />
          <div className="rail-title">💡 Tips</div>
          <ul className="tips">
            <li>Set your logo + brand colors once in the Brand Kit — they apply to every template.</li>
            <li>Use <b>Font size</b> if text gets close to the edges.</li>
            <li>Switch <b>Aspect</b> (top-right) to make 9:16, 16:9 or 1:1 versions of the same clip.</li>
            <li>Exports save to the <code>out/</code> folder — drag them into CapCut.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

function ColorPick({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="colorpick">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <span>{label}</span>
    </div>
  );
}

function ControlField({
  control,
  value,
  onChange,
}: {
  control: Control;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (control.type === "textarea") {
    return (
      <div className="field">
        <label>{control.label}</label>
        <textarea className="control" value={String(value ?? "")} placeholder={control.placeholder} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  if (control.type === "text") {
    return (
      <div className="field">
        <label>{control.label}</label>
        <input className="control" value={String(value ?? "")} placeholder={control.placeholder} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  if (control.type === "color") {
    return (
      <div className="field">
        <label>{control.label}</label>
        <div className="color-row">
          <input type="color" value={String(value ?? "#ffffff")} onChange={(e) => onChange(e.target.value)} />
          <input className="control" value={String(value ?? "#ffffff")} onChange={(e) => onChange(e.target.value)} />
        </div>
      </div>
    );
  }
  if (control.type === "select") {
    return (
      <div className="field">
        <label>{control.label}</label>
        <select className="control" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {control.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
  if (control.type === "checkbox") {
    return (
      <div className="field">
        <label className="check">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          {control.label}
        </label>
      </div>
    );
  }
  return (
    <div className="field">
      <label>
        {control.label}
        <span className="slider-val">{Number(value ?? control.min)}</span>
      </label>
      <input
        type="range"
        style={{ width: "100%" }}
        min={control.min}
        max={control.max}
        step={control.step}
        value={Number(value ?? control.min)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
