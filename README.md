# 🎬 Motion Studio

A tiny, local text-animation tool for video ads. Pick a template, type your text
(Nepali / English / mixed), set your brand colors and logo, preview it live, and
export a ready-to-use video clip — with a solid background or a transparent overlay
for editors like CapCut.

Built with **Remotion** + **Next.js**. Runs entirely on your own machine; rendering
is free (no cloud).

## Features

- 🎨 **Brand Kit** — upload a logo, set primary/accent brand colors and brand name (saved in your browser)
- ✍️ **Bilingual text** — Devanagari (Nepali) renders correctly via Mukta; Latin via Poppins
- 🧩 **Templates** — Hook Title Card · Logo + Contact Card · generic Text Animation (7 styles)
- 📐 **Aspect ratios** — Vertical 9:16, Horizontal 16:9, Square 1:1 (responsive layouts that auto-fit)
- 🔤 **Per-template controls** — background color, text color, font size, font weight, duration
- 👁️ **Live preview** — instant playback via the Remotion Player
- ⬇️ **Local export** — MP4 (with background) or transparent `.MOV` (ProRes 4444 overlay)

## Getting started

```bash
npm install
npm run studio
```

Open **http://localhost:3333**, design your clip, and click export. Files are saved to the `out/` folder.

> The first export bundles the project (~20s); subsequent exports are fast.

## Project layout

| Path | What |
|---|---|
| `app/StudioApp.tsx` | The studio UI + live preview |
| `app/api/render/route.ts` | Local render endpoint (MP4 / transparent MOV) |
| `src/studio/templateMeta.ts` | Template list + which controls each template shows |
| `src/BrandTitle.tsx`, `src/BrandCard.tsx`, `src/TextAnimation.tsx` | The animation templates |
| `src/fonts.ts` | Poppins (English) + Mukta (Nepali / Devanagari) |

## Add your own template

1. Create a parameterized Remotion component in `src/`
2. Register it in `src/Root.tsx`
3. Add an entry (label, controls, default props) in `src/studio/templateMeta.ts`
4. Map its `compositionId` → component in `src/studio/registry.tsx`

It then appears in the studio automatically.

## Commands

- `npm run studio` — run the web studio (http://localhost:3333)
- `npm run remotion` — open Remotion Studio (developer view of the raw compositions)
- `npm run studio:build` — production build of the web app

## License

UNLICENSED — free to use and adapt.
