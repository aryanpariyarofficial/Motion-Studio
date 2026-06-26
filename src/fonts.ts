// Font registry. Mukta = Poppins' Devanagari sibling (renders Nepali); the rest are
// Latin display/handwritten faces for variety. Only Mukta renders Devanagari — use it
// for Nepali text.
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadMukta } from "@remotion/google-fonts/Mukta";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadBangers } from "@remotion/google-fonts/Bangers";

export const poppins = loadPoppins("normal", { weights: ["400", "600", "700", "800"] }).fontFamily;
export const mukta = loadMukta("normal", { weights: ["500", "700", "800"], subsets: ["devanagari", "latin"] }).fontFamily;
export const anton = loadAnton().fontFamily;
export const bebas = loadBebas().fontFamily;
export const oswald = loadOswald("normal", { weights: ["400", "600", "700"], subsets: ["latin"] }).fontFamily;
export const playfair = loadPlayfair("normal", { weights: ["600", "700", "800"] }).fontFamily;
export const caveat = loadCaveat("normal", { weights: ["500", "700"] }).fontFamily;
export const bangers = loadBangers().fontFamily;

export const FONTS = { mukta, poppins, anton, bebas, oswald, playfair, caveat, bangers } as const;

export type FontKey = keyof typeof FONTS;

// for UI font pickers
export const FONT_OPTIONS: { value: FontKey; label: string }[] = [
  { value: "mukta", label: "Mukta (Nepali + EN)" },
  { value: "poppins", label: "Poppins (clean)" },
  { value: "anton", label: "Anton (heavy)" },
  { value: "bebas", label: "Bebas Neue (tall)" },
  { value: "oswald", label: "Oswald (condensed)" },
  { value: "playfair", label: "Playfair (elegant)" },
  { value: "caveat", label: "Caveat (handwritten)" },
  { value: "bangers", label: "Bangers (comic)" },
];
