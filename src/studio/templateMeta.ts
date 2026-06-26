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
  {
    id: "captions",
    label: "UGC Captions",
    description: "Word-by-word captions that build up with the active word highlighted.",
    compositionId: "Captions",
    controls: [
      { key: "text", label: "Caption text", type: "textarea", placeholder: "यो प्रोडक्ट साँच्चै राम्रो छ" },
      { key: "captionStyle", label: "Caption style", type: "select", options: [
        { value: "highlight", label: "Highlight (active word colored)" },
        { value: "box", label: "Box (highlighted box behind word)" },
        { value: "dynamic", label: "Dynamic AI (varying sizes)" },
        { value: "karaoke", label: "Karaoke (fill left→right)" },
      ] },
      { key: "textColor", label: "Text color", type: "color" },
      { key: "transparentBackground", label: "Transparent background", type: "checkbox" },
      { key: "bgColor", label: "Background color (if not transparent)", type: "color" },
      { key: "boxBehind", label: "Dark box behind text", type: "checkbox" },
      { key: "position", label: "Position", type: "select", options: [
        { value: "center", label: "Center" },
        { value: "bottom", label: "Bottom" },
      ] },
      ...fontControls,
      { key: "durationInSeconds", label: "Duration (sec)", type: "slider", min: 1, max: 10, step: 0.5 },
    ],
    defaultProps: {
      text: "यो प्रोडक्ट साँच्चै राम्रो छ",
      captionStyle: "dynamic",
      textColor: "#FFFFFF",
      transparentBackground: true,
      bgColor: "#101826",
      boxBehind: true,
      position: "center",
      fontScale: 1,
      fontWeight: 800,
      durationInSeconds: 3,
    },
  },
  {
    id: "offerCard",
    label: "CTA / Offer Card",
    description: "Big offer headline, subtitle and a call-to-action button.",
    compositionId: "OfferCard",
    controls: [
      { key: "headline", label: "Headline", type: "text", placeholder: "50% OFF" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "ctaText", label: "Button text", type: "text", placeholder: "ORDER NOW" },
      { key: "bgColor", label: "Background color", type: "color" },
      { key: "textColor", label: "Text color", type: "color" },
      ...fontControls,
      { key: "durationInSeconds", label: "Duration (sec)", type: "slider", min: 1, max: 6, step: 0.5 },
    ],
    defaultProps: {
      headline: "50% OFF",
      subtitle: "On all renovation packages this month",
      ctaText: "ORDER NOW",
      bgColor: "#0E3A33",
      textColor: "#FFFFFF",
      fontScale: 1,
      fontWeight: 900,
      durationInSeconds: 3,
    },
  },
  {
    id: "lowerThird",
    label: "Lower Third (name tag)",
    description: "Transparent name/role tag that slides in near the bottom.",
    compositionId: "LowerThird",
    controls: [
      { key: "title", label: "Title / name", type: "text", placeholder: "Aashray Construction" },
      { key: "subtitle", label: "Subtitle / role", type: "text" },
      { key: "side", label: "Side", type: "select", options: [
        { value: "left", label: "Left" },
        { value: "right", label: "Right" },
      ] },
      { key: "barColor", label: "Bar color", type: "color" },
      { key: "textColor", label: "Text color", type: "color" },
      ...fontControls,
      { key: "durationInSeconds", label: "Duration (sec)", type: "slider", min: 1, max: 8, step: 0.5 },
    ],
    defaultProps: {
      title: "AASHRAY Construction",
      subtitle: "Renovation & Interior Experts",
      side: "left",
      barColor: "#0E3A33",
      textColor: "#FFFFFF",
      fontScale: 1,
      fontWeight: 800,
      durationInSeconds: 4,
    },
  },
  {
    id: "reviewCard",
    label: "Review / Stars Card",
    description: "Animated star rating with a customer quote and name.",
    compositionId: "ReviewCard",
    controls: [
      { key: "quote", label: "Quote", type: "textarea", placeholder: "Excellent work and on time!" },
      { key: "name", label: "Customer name", type: "text" },
      { key: "rating", label: "Stars", type: "slider", min: 1, max: 5, step: 1 },
      { key: "bgColor", label: "Background color", type: "color" },
      { key: "textColor", label: "Text color", type: "color" },
      { key: "fontScale", label: "Font size", type: "slider", min: 0.4, max: 1.8, step: 0.05 },
      { key: "durationInSeconds", label: "Duration (sec)", type: "slider", min: 2, max: 8, step: 0.5 },
    ],
    defaultProps: {
      quote: "Excellent work, finished on time and on budget!",
      name: "Sita Sharma",
      rating: 5,
      bgColor: "#F1EBE1",
      textColor: "#0E3A33",
      fontScale: 1,
      durationInSeconds: 4,
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
  }
  // generic: any template with the transparent toggle on renders see-through
  if (props.transparentBackground) inputProps.bgColor = "transparent";

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
