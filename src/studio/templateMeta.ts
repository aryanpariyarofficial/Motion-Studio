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

// one-click color palettes — applied to the brand + current template's color props
export type Theme = { name: string; bg: string; text: string; accent: string; primary: string; highlight: string };
export const THEMES: Theme[] = [
  { name: "Cream", bg: "#F1EBE1", text: "#0E3A33", accent: "#E8491F", primary: "#0E3A33", highlight: "#FFE100" },
  { name: "Midnight", bg: "#0B1220", text: "#FFFFFF", accent: "#3DA9FC", primary: "#16314A", highlight: "#3DA9FC" },
  { name: "Forest", bg: "#082420", text: "#FFFFFF", accent: "#E8491F", primary: "#0E3A33", highlight: "#FFD60A" },
  { name: "Sunset", bg: "#1A1124", text: "#FFFFFF", accent: "#FF7A00", primary: "#7A1FA2", highlight: "#FFB703" },
  { name: "Mono", bg: "#111111", text: "#FFFFFF", accent: "#FFFFFF", primary: "#777777", highlight: "#FFE100" },
  { name: "Paper", bg: "#FFFFFF", text: "#16314A", accent: "#E8941F", primary: "#16314A", highlight: "#FFE100" },
];

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

// plain font list (kept here so this file stays import-free of the font loaders)
const FONT_SELECT = [
  { value: "mukta", label: "Mukta (Nepali + EN)" },
  { value: "poppins", label: "Poppins (clean)" },
  { value: "anton", label: "Anton (heavy)" },
  { value: "bebas", label: "Bebas Neue (tall)" },
  { value: "oswald", label: "Oswald (condensed)" },
  { value: "playfair", label: "Playfair (elegant)" },
  { value: "caveat", label: "Caveat (handwritten)" },
  { value: "bangers", label: "Bangers (comic)" },
];

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
      { key: "contactWidth", label: "Contact text width", type: "slider", min: 12, max: 40, step: 1 },
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
      contactWidth: 24,
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
      { key: "fontKey", label: "Font", type: "select", options: FONT_SELECT },
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
  {
    id: "typingList",
    label: "Typing List (points)",
    description: "Heading + points that type in one by one with an animated box border.",
    compositionId: "TypingList",
    controls: [
      { key: "heading", label: "Heading", type: "text", placeholder: "यस तालिममा" },
      { key: "items", label: "List items (one per line)", type: "textarea", placeholder: "कम्पनी दर्ता\nवार्षिक कर\nVAT/PAN" },
      { key: "marker", label: "Bullet marker", type: "select", options: [
        { value: "number", label: "Numbers (१. २. ३.)" },
        { value: "check", label: "Check ✓" },
        { value: "dot", label: "Dot ●" },
        { value: "none", label: "None" },
      ] },
      { key: "headingStyle", label: "Heading style", type: "select", options: [
        { value: "highlight", label: "Highlighter" },
        { value: "underline", label: "Underline" },
        { value: "box", label: "Box" },
        { value: "plain", label: "Plain" },
      ] },
      { key: "borderStyle", label: "Item border style", type: "select", options: [
        { value: "box", label: "Box (rounded rectangle)" },
        { value: "underline", label: "Underline" },
        { value: "dashed", label: "Dashed box" },
        { value: "none", label: "None" },
      ] },
      { key: "borderWidth", label: "Border width (px)", type: "slider", min: 0, max: 14, step: 0.5 },
      { key: "cornerRadius", label: "Corner roundness", type: "slider", min: 0, max: 40, step: 1 },
      { key: "itemFill", label: "Filled highlight behind items", type: "checkbox" },
      { key: "activeEmphasis", label: "Emphasize the typing item", type: "checkbox" },
      { key: "showCaret", label: "Show typing cursor", type: "checkbox" },
      { key: "backgroundStyle", label: "Background style", type: "select", options: [
        { value: "grid", label: "Grid" },
        { value: "dots", label: "Dots" },
        { value: "gradient", label: "Soft gradient" },
        { value: "plain", label: "Plain" },
      ] },
      { key: "bgColor", label: "Background color", type: "color" },
      { key: "headingColor", label: "Heading color", type: "color" },
      { key: "highlightColor", label: "Heading highlight", type: "color" },
      { key: "textColor", label: "Item text color", type: "color" },
      ...fontControls,
      { key: "durationInSeconds", label: "Duration (sec)", type: "slider", min: 2, max: 12, step: 0.5 },
    ],
    defaultProps: {
      heading: "यस तालिममा",
      items: "कम्पनी दर्ता\nवार्षिक कर विवरण\nVAT / PAN दर्ता",
      marker: "number",
      headingStyle: "highlight",
      showCaret: false,
      borderStyle: "box",
      borderWidth: 3,
      cornerRadius: 10,
      itemFill: false,
      activeEmphasis: false,
      backgroundStyle: "grid",
      bgColor: "#FFFFFF",
      headingColor: "#16314A",
      highlightColor: "#FFE100",
      textColor: "#16314A",
      fontScale: 1,
      fontWeight: 700,
      durationInSeconds: 5,
    },
  },
  {
    id: "motionTypography",
    label: "Motion Typography",
    description: "Loud editorial words scrolling up in a seamless loop with big/small size contrast.",
    compositionId: "MotionTypography",
    controls: [
      { key: "mode", label: "Style", type: "select", options: [
        { value: "reveal", label: "Reveal (zoom through words)" },
        { value: "loop", label: "Loop (continuous scroll)" },
      ] },
      { key: "autoDesign", label: "Auto-design (just paste a sentence)", type: "checkbox" },
      { key: "segments", label: "Words — one per line: TEXT | size | color | italic  (add | focus to mark a zoom stop)", type: "textarea", placeholder: "ever wanted | 10\nvisually | 16 | accent | focus\nbeautiful | 12 | | italic\ntypography? | 12 | | focus" },
      { key: "fontKey", label: "Font", type: "select", options: FONT_SELECT },
      { key: "direction", label: "Reveal direction", type: "select", options: [
        { value: "out", label: "Zoom out (word → full)" },
        { value: "in", label: "Zoom in (full → word)" },
      ] },
      { key: "motionPreset", label: "Motion feel", type: "select", options: [
        { value: "snappy", label: "Snappy" },
        { value: "smooth", label: "Smooth" },
        { value: "bouncy", label: "Bouncy" },
      ] },
      { key: "secondsPerStop", label: "Time per stop (sec)", type: "slider", min: 0.2, max: 2, step: 0.1 },
      { key: "tilt", label: "Tilt during moves (°)", type: "slider", min: 0, max: 8, step: 0.5 },
      { key: "exitType", label: "Exit", type: "select", options: [
        { value: "none", label: "Hold" },
        { value: "fade", label: "Fade out" },
        { value: "zoomIn", label: "Zoom in + fade" },
      ] },
      { key: "accentStyle", label: "Accent word style", type: "select", options: [
        { value: "plain", label: "Plain (colored)" },
        { value: "highlight", label: "Highlight chip" },
        { value: "box", label: "Box" },
        { value: "underline", label: "Underline" },
      ] },
      { key: "bgType", label: "Background type", type: "select", options: [
        { value: "solid", label: "Solid" },
        { value: "gradient", label: "Gradient" },
      ] },
      { key: "bgColor", label: "Background", type: "color" },
      { key: "bgColor2", label: "Background 2 (gradient)", type: "color" },
      { key: "inkColor", label: "Text color", type: "color" },
      { key: "emphasisColor", label: "Accent color", type: "color" },
      { key: "emphasisColor2", label: "Accent color 2", type: "color" },
      { key: "secondsPerLoop", label: "Loop speed (sec) — loop mode", type: "slider", min: 4, max: 30, step: 1 },
      { key: "fontWeight", label: "Font weight", type: "slider", min: 400, max: 900, step: 100 },
      { key: "durationInSeconds", label: "Duration (sec)", type: "slider", min: 2, max: 30, step: 0.5 },
    ],
    defaultProps: {
      mode: "reveal",
      autoDesign: false,
      segments: "ever wanted | 10\nto | 3.5\nmake | 4 | accent\nvisually | 16 | accent | focus\nbeautiful | 12 | | italic\nmotion | 7 | accent\ntypography? | 12 | | focus",
      fontKey: "anton",
      direction: "out",
      motionPreset: "snappy",
      secondsPerStop: 0.7,
      tilt: 2,
      exitType: "none",
      accentStyle: "plain",
      bgType: "solid",
      bgColor: "#F5D31B",
      bgColor2: "#FF7A00",
      inkColor: "#111111",
      emphasisColor: "#6B5EE4",
      emphasisColor2: "#E8491F",
      secondsPerLoop: 12,
      fontWeight: 800,
      durationInSeconds: 5,
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
