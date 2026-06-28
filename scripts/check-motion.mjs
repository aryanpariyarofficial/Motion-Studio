import path from "path";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), "src", "index.ts") });
const props = { segments: "DESIGN\nin motion | 4\nTYPOGRAPHY | 16 | accent\nthat moves | 3.5 | | italic\nBOLD\nLOUD | 13 | accent\n& fast | 4\nEDITORIAL | 11", fontKey: "anton", secondsPerLoop: 12, bgColor: "#F5D31B", inkColor: "#111111", emphasisColor: "#6B5EE4", fontWeight: 800, durationInSeconds: 8 };
const c = await selectComposition({ serveUrl, id: "MotionTypography", inputProps: props });
for (const f of [20, 110]) {
  await renderStill({ composition: { ...c, width: 1080, height: 1920 }, serveUrl, output: `out/motion-${f}.png`, inputProps: props, frame: f, imageFormat: "png" });
  console.log("wrote", f);
}
process.exit(0);
