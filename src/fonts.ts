// Lean font set. Mukta = Poppins' Devanagari sibling (same foundry, same geometric look),
// so Nepali text actually renders instead of showing empty boxes.
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadMukta } from "@remotion/google-fonts/Mukta";

export const poppins = loadPoppins("normal", {
  weights: ["400", "600", "700", "800"],
}).fontFamily;

export const mukta = loadMukta("normal", {
  weights: ["500", "700", "800"],
  subsets: ["devanagari", "latin"],
}).fontFamily;

export const FONTS = { poppins, mukta } as const;

export type FontKey = keyof typeof FONTS;
