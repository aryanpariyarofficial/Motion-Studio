import path from "path";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), "src", "index.ts") });
const props = { heading: "यस तालिममा", items: "कम्पनी दर्ता\nवार्षिक कर विवरण\nVAT / PAN दर्ता", autoNumber: true, bgColor: "#FFFFFF", textColor: "#16314A", accentColor: "#E8941F", highlightColor: "#FFE100", headingColor: "#16314A", fontScale: 1, fontWeight: 700, durationInSeconds: 5 };
const c = await selectComposition({ serveUrl, id: "TypingList", inputProps: props });
for (const f of [55, 110]) {
  await renderStill({ composition: { ...c, width: 1080, height: 1350 }, serveUrl, output: `out/typing-${f}.png`, inputProps: props, frame: f, imageFormat: "png" });
  console.log("wrote", f);
}
process.exit(0);
