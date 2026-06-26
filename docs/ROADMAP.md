# 🗺 Motion Studio — Roadmap & Plans

## Part A — Custom Template Editor

### Goal
Let you build your **own free-form layouts** instead of only filling in fixed templates:
place text / logo / image / shape / sticker layers anywhere, set each one's color, size,
font, animation and timing, then save it as your own reusable template and export it.

### Core idea: a layer-based "scene"
A custom design = one JSON **scene**:

```
Scene {
  aspect, durationInSeconds, background (color | gradient | transparent | image)
  layers: [
    Layer {
      id, type: text | logo | image | shape | sticker,
      content,                       // text string / image src / shape kind
      transform { x%, y%, scale, rotation, anchor },   // % = aspect-responsive
      style { color, fontKey, fontWeight, letterSpacing, ... },
      animateIn, animateOut, startSec, endSec
    }, ...
  ]
}
```

- Positions are **percentages**, so a scene works in 9:16, 16:9 and 1:1 automatically.
- One generic Remotion composition, `CustomScene`, renders any scene JSON (loops layers,
  applies the animation presets we already built, positions them absolutely).

### The editor UI
```
┌── Layers ──┐┌──────── Canvas (live) ────────┐┌── Inspector ──┐
│ + Text     ││  [Remotion Player preview]    ││ selected layer │
│ + Logo     ││  + drag/resize overlay boxes  ││ text / content │
│ + Image    ││                               ││ font / size    │
│ + Shape    ││   (click a layer to select,   ││ color          │
│ ▤ layer 1  ││    drag to move, handles to   ││ x / y / scale  │
│ ▤ layer 2  ││    resize/rotate)             ││ animation in/out│
│ 🔒 👁 🗑     ││                               ││ start / end    │
└────────────┘└───────────────────────────────┘└────────────────┘
            └─────────── (optional) timeline strip ───────────┘
```

- **Center** = the Remotion Player (shows the real animation) with an **interactive overlay**
  drawn on top. The overlay boxes come straight from each layer's % transform × the preview
  fit-size, so editing is independent of the current animation frame. While editing we pause
  the Player on a "settled" frame so the visual matches the boxes.
- **Drag to move** → convert pixel delta to % of canvas → update `x/y`.
- **Handles** → resize (scale / font size) + rotate.
- **Left** = layer list (add / reorder / lock / hide / delete / duplicate).
- **Right** = inspector for the selected layer.
- **Persistence** = save scenes to the browser + export/import as `.json` ("My Templates").

### Phases
| Phase | Scope |
|---|---|
| **v1 — MVP editor** | Text + logo + image layers · click-select · drag-to-move · numeric size/rotation · per-layer color/font/animation-in + delay · background (color/transparent) · save/load scene · export via `CustomScene`. No timeline (uses delay + global duration). |
| **v2** | Resize/rotate handles · shapes & sticker layers · out-animations · alignment guides + snapping · duplicate/multi-select · simple per-layer timeline (start/end). |
| **v3** | Keyframes (animate any property over time) · groups · masks · **convert existing templates** (Hook Title, Contact Card) into editable scenes you can tweak. |

### Notes / risks
- Drag math must account for the preview scale (we already compute the fit size).
- Reuse the 7 existing animation styles as "in" presets; add matching "out" presets.
- Export already works — `CustomScene` just takes the scene JSON as input props.
- This is the **single biggest feature**; best done as its own milestone after the quick wins below.

---

## Part B — Feature recommendations (prioritized)

| # | Feature | Why it matters (for UGC / ad work) | Value | Effort |
|---|---|---|---|---|
| 1 | **UGC word-by-word captions** | The #1 element in UGC ads — karaoke captions that follow speech. Paste a script → auto-timed words with highlight. | ⭐⭐⭐⭐⭐ | Med |
| 2 | **Multiple brand kits (client switcher)** | You make ads for many brands — save a named kit (logo+colors+contact) per client and switch instantly. | ⭐⭐⭐⭐⭐ | Low |
| 3 | **Batch export all aspect ratios** | One click → 9:16 + 1:1 + 16:9 of the same clip. Massive time-saver for posting across platforms. | ⭐⭐⭐⭐⭐ | Low |
| 4 | **Auto color extraction from logo** | Upload a logo → auto-suggest primary/accent colors. Makes the Brand Kit one-click. | ⭐⭐⭐⭐ | Low |
| 5 | **More templates: CTA / offer cards** | "50% OFF", "Order Now", price tags, discount bursts, end-screens with socials, lower-thirds, review/star card. | ⭐⭐⭐⭐ | Med |
| 6 | **Background options** | Solid / gradient / transparent / image / subtle animated patterns — per template. | ⭐⭐⭐ | Low-Med |
| 7 | **Logo background removal** | Auto-cutout white-background logos so they sit cleanly on any color. | ⭐⭐⭐ | Med |
| 8 | **Sound / music** | Whoosh/pop on text-in, or a background track, baked into the export. | ⭐⭐⭐ | Med |
| 9 | **Bilingual auto-font per word** | Detect Devanagari vs Latin per word → Mukta for Nepali, Poppins for English, in the same line. | ⭐⭐⭐ | Med |
| 10 | **Stickers / elements library** | Drag-in arrows, emojis, badges, the money/timer effects — pairs with the editor. | ⭐⭐⭐ | Med |
| 11 | **Render progress bar** | Show % during export instead of a spinner. | ⭐⭐ | Low |
| 12 | **Safe-area guides** | Show TikTok/Reels UI safe zones so text isn't hidden behind platform UI. | ⭐⭐ | Low |
| 13 | **Auto captions from audio (Whisper)** | Upload a voiceover → auto-transcribe + time captions. Supercharges #1. | ⭐⭐⭐⭐ | High |

---

## Recommended build order

Quick, high-value wins first; the big editor as a dedicated milestone afterward.

1. **Multiple brand kits** + **auto color extraction** (low effort, instant daily value)
2. **Batch export all aspect ratios** (low effort, huge time-saver)
3. **UGC word-by-word captions** template (highest single value)
4. **CTA / offer card templates** (the ad bread-and-butter)
5. **Background options** + **render progress bar** (polish)
6. **Custom Template Editor v1** (the big one)
7. Then iterate the editor (v2/v3) and add stickers, sound, auto-captions.
