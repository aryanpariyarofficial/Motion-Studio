// Browser-only helper: pull two brand colors (primary + accent) out of a logo image.
// Quantizes pixels, ignores transparent / near-white / near-black, then picks the
// darkest prominent color as "primary" and the most saturated as "accent".

type RGB = { r: number; g: number; b: number };

const toHex = ({ r, g, b }: RGB) =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();

const sat = ({ r, g, b }: RGB) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
};
const lum = ({ r, g, b }: RGB) => 0.299 * r + 0.587 * g + 0.114 * b;
const dist = (a: RGB, b: RGB) => Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export async function extractBrandColors(
  dataUrl: string,
): Promise<{ primary: string; accent: string } | null> {
  try {
    const img = await loadImage(dataUrl);
    const W = 64;
    const H = 64;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, W, H);
    const { data } = ctx.getImageData(0, 0, W, H);

    const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 128) continue; // transparent
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max > 238 && min > 238) continue; // near-white background
      if (max < 18) continue; // near-black noise
      const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
      const e = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };
      e.count++;
      e.r += r;
      e.g += g;
      e.b += b;
      buckets.set(key, e);
    }

    const colors = [...buckets.values()].map((e) => ({
      count: e.count,
      r: Math.round(e.r / e.count),
      g: Math.round(e.g / e.count),
      b: Math.round(e.b / e.count),
    }));
    if (!colors.length) return null;

    colors.sort((a, b) => b.count - a.count);
    const top = colors.slice(0, 8);

    const accent = [...top].sort((a, b) => sat(b) - sat(a))[0];
    const primary =
      [...top].sort((a, b) => lum(a) - lum(b)).find((c) => dist(c, accent) > 60) || top[0];

    return { primary: toHex(primary), accent: toHex(accent) };
  } catch {
    return null;
  }
}
