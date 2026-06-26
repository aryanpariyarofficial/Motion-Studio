import path from "path";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";

const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), "src", "index.ts") });

async function still(id, inputProps, w, h, frame, out) {
  const c = await selectComposition({ serveUrl, id, inputProps });
  await renderStill({
    composition: { ...c, width: w, height: h },
    serveUrl,
    output: out,
    inputProps,
    frame,
    imageFormat: "png",
  });
  console.log("wrote", out);
}

const longText = "र नयाँ निर्माण, पुरानो घरको मजबुतीकरण देखि प्रिमियम Interior सम्म";

// TextAnimation — vertical & square with long text (was overflowing before)
await still(
  "TextAnimation",
  { text: longText, animation: "wordPop", fontKey: "mukta", textColor: "#FFFFFF", bgColor: "#101826", accentColor: "#E8491F", uppercase: false, fontWeight: 800, fontScale: 1, letterSpacingPx: 2, fontSizePx: null, orientation: "vertical", durationInSeconds: 3 },
  1080, 1920, 80, "out/fit-text-vertical.png",
);
await still(
  "TextAnimation",
  { text: longText, animation: "wordPop", fontKey: "mukta", textColor: "#FFFFFF", bgColor: "#101826", accentColor: "#E8491F", uppercase: false, fontWeight: 800, fontScale: 1, letterSpacingPx: 2, fontSizePx: null, orientation: "square", durationInSeconds: 3 },
  1080, 1080, 80, "out/fit-text-square.png",
);

// BrandCard — square (should now stack vertically)
await still(
  "BrandCard",
  { name: "AASHRAY", tagline: "RENOVATION AND CONSTRUCTION SOLUTIONS", location: "Imadol, Lalitpur", email: "info@aashrayrenovationandconstructionsolution.co", phone: "9705218192", bgColor: "#F1EBE1", textColor: "#0E3A33", primaryColor: "#0E3A33", accentColor: "#E8491F", logoSrc: null, fontScale: 1, fontWeight: 800, durationInSeconds: 5 },
  1080, 1080, 130, "out/fit-card-square.png",
);

process.exit(0);
