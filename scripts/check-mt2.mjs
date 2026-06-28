import path from "path";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), "src", "index.ts") });
const def = { mode: "reveal", autoDesign: false, segments: "ever wanted | 10\nto | 3.5\nmake | 4 | accent\nvisually | 16 | accent | focus\nbeautiful | 12 | | italic\nmotion | 7 | accent\ntypography? | 12 | | focus", fontKey: "anton", direction: "out", motionPreset: "snappy", secondsPerStop: 0.7, tilt: 2, exitType: "none", accentStyle: "plain", bgType: "solid", bgColor: "#F5D31B", bgColor2: "#FF7A00", inkColor: "#111111", emphasisColor: "#6B5EE4", emphasisColor2: "#E8491F", fontWeight: 800, durationInSeconds: 5 };
async function shot(props, f, out) {
  const c = await selectComposition({ serveUrl, id: "MotionTypography", inputProps: props });
  await renderStill({ composition: { ...c, width: 1920, height: 1080 }, serveUrl, output: out, inputProps: props, frame: f, imageFormat: "png" });
  console.log("wrote", out);
}
await shot(def, 2, "out/mt-stop1.png");
await shot(def, 21, "out/mt-stop2.png");
await shot(def, 70, "out/mt-full.png");
// auto-design + highlight chips + gradient
const auto = { ...def, autoDesign: true, segments: "paste any sentence and watch it design itself beautifully", accentStyle: "highlight", bgType: "gradient", bgColor: "#1A1124", bgColor2: "#7A1FA2", inkColor: "#FFFFFF", emphasisColor: "#FF7A00", emphasisColor2: "#3DA9FC", durationInSeconds: 5 };
await shot(auto, 80, "out/mt-auto.png");
process.exit(0);
