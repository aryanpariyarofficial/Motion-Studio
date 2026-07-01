import path from "path";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), "src", "index.ts") });
const props = { name: "AASHRAY", tagline: "RENOVATION AND CONSTRUCTION SOLUTIONS", location: "Imadol, Lalitpur", email: "info@aashrayrenovationandconstructionsolution.co", phone: "9705218192", bgColor: "#F1EBE1", textColor: "#0E3A33", primaryColor: "#0E3A33", accentColor: "#E8491F", logoSrc: null, contactWidth: 24, fontScale: 1, fontWeight: 800, durationInSeconds: 6 };
const c = await selectComposition({ serveUrl, id: "BrandCard", inputProps: props });
await renderStill({ composition: { ...c, width: 1080, height: 1920 }, serveUrl, output: "out/card-email.png", inputProps: props, frame: 150, imageFormat: "png" });
console.log("done");
process.exit(0);
