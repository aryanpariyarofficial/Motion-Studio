# 🎬 Motion Studio

> A tiny, local tool for making **animated text & brand assets** for video ads — in Nepali, English, or both.

Pick a template, type your text, set your brand colors and logo, preview it live, and
export a ready-to-use clip — with a solid background or a **transparent overlay** for
editors like CapCut. Runs entirely on your machine; rendering is **free** (no cloud).

Built with **[Remotion](https://www.remotion.dev/)** + **[Next.js](https://nextjs.org/)**.

![Motion Studio — Hook Title Card](docs/ui-hook.png)

---

## ✨ Features

- 🎨 **Brand Kit** — upload a logo, set primary/accent brand colors and brand name once; it applies to every template (saved in your browser).
- ✍️ **Bilingual text** — Devanagari (Nepali) renders correctly via **Mukta**; Latin via **Poppins**. Mixed Nepali + English lines just work.
- 🧩 **Templates** — Hook Title Card · Logo + Contact Card · generic Text Animation (7 styles).
- 📐 **Aspect ratios** — Vertical 9:16, Horizontal 16:9, Square 1:1 — responsive layouts that **auto-fit** the text.
- 🔤 **Per-template controls** — background color, text color, font size, font weight, duration.
- 👁️ **Live preview** — instant playback via the Remotion Player, fit to your screen.
- ⬇️ **Local export** — MP4 (with background) or transparent `.MOV` (ProRes 4444 overlay).

---

## 📸 Screenshots

**Logo + Contact Card** — animated logo build with contact rows (great as an intro/outro):

![Logo + Contact Card](docs/ui-card.png)

**Text Animation** in vertical 9:16, with the live preview fit to the viewport:

![Text Animation — Vertical](docs/ui-text-vertical.png)

---

## 🚀 Getting started

```bash
npm install
npm run studio
```

Open **http://localhost:3333** in your browser.

> 💡 The first export bundles the project (~20s); every export after that is fast.

---

## 🧑‍🎨 How to use

1. **Set up your Brand Kit (left panel)** — type your brand name, click **Upload logo** (PNG with transparency is best), and pick your **Primary** and **Accent** colors. These apply to every template and are remembered next time.
2. **Pick a template** from the dropdown.
3. **Choose an aspect ratio** (top-right): Vertical 9:16, Horizontal 16:9, or Square 1:1.
4. **Fill in the fields** — your text (Nepali / English / mixed), colors, **font size**, font weight, and duration. The preview updates instantly.
5. **Export (right panel):**
   - **Export MP4** → solid background — perfect as an intro/outro or full title card.
   - **Export transparent .MOV** → see-through overlay — drop it *on top* of your footage in CapCut.
6. Your file is saved to the **`out/`** folder. Drag it onto your CapCut timeline. Done. ✅

---

## 🧩 Templates

| Template | What it is |
|---|---|
| **Hook Title Card** | Bold branded tagline with particle field, brand kicker and underline. Great opener/hook. |
| **Logo + Contact Card** | Animated logo build + contact rows (location / email / phone). Intro or outro. |
| **Text Animation** | Generic engine with 7 styles: Kinetic Scale, Word Pop, Fade + Slide Up, Letter Cascade, Typewriter, Glitch, Neon Glow. |

---

## 🛠 Project structure

| Path | What |
|---|---|
| `app/StudioApp.tsx` | The studio UI + live preview |
| `app/api/render/route.ts` | Local render endpoint (MP4 / transparent MOV) |
| `src/studio/templateMeta.ts` | Template list + which controls each template shows |
| `src/BrandTitle.tsx`, `src/BrandCard.tsx`, `src/TextAnimation.tsx` | The animation templates |
| `src/fonts.ts` | Poppins (English) + Mukta (Nepali / Devanagari) |
| `out/` | Your exported videos (git-ignored) |

### Add your own template

1. Create a parameterized Remotion component in `src/`.
2. Register it in `src/Root.tsx`.
3. Add an entry (label, controls, default props) in `src/studio/templateMeta.ts`.
4. Map its `compositionId` → component in `src/studio/registry.tsx`.

It then appears in the studio automatically.

---

## 📦 Commands

| Command | What it does |
|---|---|
| `npm run studio` | Run the web studio at http://localhost:3333 |
| `npm run remotion` | Open Remotion Studio (developer view of the raw compositions) |
| `npm run studio:build` | Production build of the web app |

---

## 🗺 Roadmap

- UGC word-by-word captions (paste a script → timed captions)
- Save multiple brand kits (one per client)
- Logo background removal
- More templates: CTA / price cards, lower-thirds
- Custom-template editor (free-form layouts)

---

## License

UNLICENSED — free to use and adapt.
