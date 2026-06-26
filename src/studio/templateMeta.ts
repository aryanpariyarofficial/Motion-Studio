// Pure metadata describing each template and its editable controls.
// No React / font imports here so the Node render route can import it safely.

export const FPS = 30;

export const ASPECTS = {
  vertical: { label: "Vertical 9:16", w: 1080, h: 1920, orientation: "vertical" },
  horizontal: { label: "Horizontal 16:9", w: 1920, h: 1080, orientation: "horizontal" },
  square: { label: "Square 1:1", w: 1080, h: 1080, orientation: "square" },
} as const;

export type AspectKey = keyof typeof ASPECTS;

export type Brand = {
  name: string;
  logoSrc: string | null;
  primary: string;
  accent: string;
};

export const DEFAULT_BRAND: Brand = {
  name: "AASHRAY",
  logoSrc: null,
  primary: "#0E3A33",
  accent: "#E8491F",
};

export type Control =
  | { key: string; label: string; type: "text" | "textarea" | "color"; placeholder?: string }
  | { key: string; label: string; type: "number" | "slider"; min: number; max: number; step: number }
  | { key: string; label: string; type: "checkbox" }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[] };

export type TemplateMeta = {
  id: string;
  label: string;
  description: string;
  compositionId: string;
  controls: Control[];
  defaultProps: Record<string, unknown>;
};

const ANIMATION_OPTIONS = [
  { value: "kineticScale", label: "Kinetic Scale" },
  { value: "wordPop", label: "Word Pop" },
  { value: "fadeSlideUp", label: "Fade + Slide Up" },
  { value: "letterCascade", label: "Letter Cascade" },
  { value: "typewriter", label: "Typewriter" },
  { value: "glitch", label: "Glitch" },
  { value: "neonGlow", label: "Neon Glow" },
];

// reusable control blocks
const fontControls: Control[] = [
  { key: "fontScale", label: "Font size", type: "slider", min: 0.4, max: 1.8, step: 0.05 },
  { key: "fontWeight", label: "Font weight", type: "slider", min: 400, max: 900, step: 100 },
];

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "hookTitle",
    label: "Hook Title Card",
    description: "Bold branded tagline with particle field, kicker and underline.",
    compositionId: "BrandTitle",
    controls: [
      { key: "text", label: "Text (Nepali / English)", type: "textarea", placeholder: "सोचेजस्तो बन्ला कि नबन्ला?" },
      { key: "bgColor", label: "Background color", type: "color" },
      { key: "textColor", label: "Text color", type: "color" },
      ...fontControls,
      { key: "durationInSeconds", label: "Duration (sec)", type: "slider", min: 1, max: 6, step: 0.5 },
    ],
    defaultProps: {
      text: "सोचेजस्तो बन्ला कि नबन्ला?",
      bgColor: "#082420",
      textColor: "#FFFFFF",
      fontScale: 1,
      fontWeight: 800,
      durationInSeconds: 2,
    },
  },
  {
    id: "brandCard",
    label: "Logo + Contact Card",
    description: "Animated logo build with contact rows. Great as an intro/outro.",
    compositionId: "BrandCard",
    controls: [
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "bgColor", label: "Background color", type: "color" },
      { key: "textColor", label: "Text color", type: "color" },
      ...fontControls,
      { key: "durationInSeconds", label: "Duration (sec)", type: "slider", min: 3, max: 8, step: 0.5 },
    ],
    defaultProps: {
      tagline: "RENOVATION AND CONSTRUCTION SOLUTIONS",
      location: "Imadol, Lalitpur",
      email: "info@aashrayrenovationandconstructionsolution.co",
      phone: "9705218192",
      bgColor: "#F1EBE1",
      textColor: "#0E3A33",
      fontScale: 1,
      fontWeight: 800,
      durationInSeconds: 5,
    },
  },
  {
    id: "textAnim",
    label: "Text Animation",
    description: "Generic text animation engine — pick a style, color and aspect ratio.",
    compositionId: "TextAnimation",
    controls: [
      { key: "text", label: "Text (Nepali / English)", type: "textarea", placeholder: "तपाईंको पाठ यहाँ" },
      { key: "animation", label: "Animation style", type: "select", options: ANIMATION_OPTIONS },
      { key: "textColor", label: "Text color", type: "color" },
      { key: "transparentBackground", label: "Transparent background", type: "checkbox" },
      { key: "bgColor", label: "Background color (if not transparent)", type: "color" },
      { key: "uppercase", label: "UPPERCASE", type: "checkbox" },
      ...fontControls,
      { key: "durationInSeconds", label: "Duration (sec)", type: "slider", min: 1, max: 8, step: 0.5 },
    ],
    defaultProps: {
      text: "नयाँ सुरुवात",
      animation: "kineticScale",
      fontKey: "mukta",
      textColor: "#FFFFFF",
      transparentBackground: true,
      bgColor: "#111111",
      uppercase: false,
      letterSpacingPx: 2,
      fontSizePx: null,
      fontScale: 1,
      fontWeight: 800,
      durationInSeconds: 3,
    },
  },
];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);

// Build the exact inputProps + composition config for the Player or renderer.
export function buildComposition(
  templateId: string,
  props: Record<string, unknown>,
  aspect: AspectKey,
  brand: Brand,
) {
  const meta = getTemplate(templateId);
  if (!meta) throw new Error(`Unknown template: ${templateId}`);

  const dims = ASPECTS[aspect];
  const inputProps: Record<string, unknown> = { ...props };

  // inject brand identity into every template
  inputProps.primaryColor = brand.primary;
  inputProps.accentColor = brand.accent;
  inputProps.logoSrc = brand.logoSrc;

  if (meta.compositionId === "BrandTitle") {
    inputProps.brandName = brand.name;
  }
  if (meta.compositionId === "BrandCard") {
    inputProps.name = brand.name;
  }
  if (meta.compositionId === "TextAnimation") {
    inputProps.orientation = dims.orientation;
    if (props.transparentBackground) inputProps.bgColor = "transparent";
  }

  const seconds = typeof props.durationInSeconds === "number" ? props.durationInSeconds : 3;

  return {
    compositionId: meta.compositionId,
    width: dims.w,
    height: dims.h,
    fps: FPS,
    durationInFrames: Math.max(1, Math.round(seconds * FPS)),
    inputProps,
  };
}
