import path from "path";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), "src", "index.ts") });
const props = { mode: "reveal", segments: "ever wanted | 10\nto | 3.5\nmake | 4 | accent\nvisually | 16 | accent\nbeautiful | 12 | | italic\nmotion | 7 | accent\ntypography? | 12 | | focus", fontKey: "anton", bgColor: "#F5D31B", inkColor: "#111111", emphasisColor: "#6B5EE4", fontWeight: 800, durationInSeconds: 4 };
const c = await selectComposition({ serveUrl, id: "MotionTypography", inputProps: props });
for (const f of [1, 22, 95]) {
  await renderStill({ composition: { ...c, width: 1920, height: 1080 }, serveUrl, output: `out/reveal-${f}.png`, inputProps: props, frame: f, imageFormat: "png" });
  console.log("wrote", f);
}
process.exit(0);
