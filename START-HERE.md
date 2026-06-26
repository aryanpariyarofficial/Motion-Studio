# 🎬 Motion Studio — Quick Start

Your personal, local tool for making animated text & brand assets for video ads.

## Run it
```bash
cd "D:\capcut animation\text-anim"
npm run studio
```
Then open **http://localhost:3333** in your browser.

## How to use
1. Pick a **template** (Hook Title / Logo + Contact Card / Text Animation)
2. Fill in the **text** (Nepali, English, or mixed — fonts auto-handle Devanagari)
3. Adjust **colors / animation / aspect ratio / duration**
4. Watch the **live preview** update instantly
5. Click **Export** → file is saved to the `out/` folder → drag it into CapCut

- **Export MP4** = full background (good for intros/title cards)
- **Export transparent .MOV** = see-through overlay (drop on top of your footage)

> First export takes ~20s (it bundles the project once); every export after that is fast.

## What's inside
- `app/` — the studio web app (Next.js + Remotion Player)
- `src/BrandTitle.tsx`, `src/BrandCard.tsx`, `src/TextAnimation.tsx` — the templates
- `src/studio/templateMeta.ts` — template list + which controls each one shows
- `src/fonts.ts` — Poppins (English) + Mukta (Nepali/Devanagari)
- `out/` — your exported videos

## Other commands
- `npm run remotion` — open Remotion Studio (developer view of the raw compositions)

## Next steps (planned)
- Logo upload + auto brand-color extraction
- Brand kits (save logo + colors per client)
- UGC word-by-word captions template
- Per-template color theming (background / text / accent)
