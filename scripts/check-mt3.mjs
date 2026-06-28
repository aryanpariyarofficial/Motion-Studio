import path from "path";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), "src", "index.ts") });
const base = { autoDesign: false, segments: "ever wanted | 10\nto | 3.5\nmake | 4 | accent\nvisually | 16 | accent | focus\nbeautiful | 12 | | italic\nmotion | 7 | accent\ntypography? | 12 | | focus", fontKey: "anton", direction: "out", motionPreset: "snappy", secondsPerStop: 0.7, tilt: 2, exitType: "none", accentStyle: "plain", bgType: "solid", bgColor: "#F5D31B", bgColor2: "#FF7A00", inkColor: "#111111", emphasisColor: "#6B5EE4", emphasisColor2: "#E8491F", secondsPerLoop: 6, fontWeight: 800, durationInSeconds: 6 };
async function shot(props, f, out) {
  const c = await selectComposition({ serveUrl, id: "MotionTypography", inputProps: props });
  await renderStill({ composition: { ...c, width: 1080, height: 1920 }, serveUrl, output: out, inputProps: props, frame: f, imageFormat: "png" });
  console.log("wrote", out);
}
await shot({ ...base, mode: "loop" }, 40, "out/mt-loop.png");
await shot({ ...base, mode: "reveal" }, 60, "out/mt-reveal-ok.png");
process.exit(0);
