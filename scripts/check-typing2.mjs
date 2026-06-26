import path from "path";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), "src", "index.ts") });
async function still(props, frame, out, h=1350) {
  const c = await selectComposition({ serveUrl, id: "TypingList", inputProps: props });
  await renderStill({ composition: { ...c, width: 1080, height: h }, serveUrl, output: out, inputProps: props, frame, imageFormat: "png" });
  console.log("wrote", out);
}
const base = { items: "कम्पनी दर्ता\nवार्षिक कर विवरण", autoNumber: true, showCaret: false, bgColor: "#FFFFFF", textColor: "#16314A", accentColor: "#E8941F", highlightColor: "#FFE100", headingColor: "#16314A", fontScale: 1, fontWeight: 700, durationInSeconds: 5 };
// empty heading -> no yellow box; thick box border
await still({ ...base, heading: "", borderStyle: "box", borderWidth: 6, cornerRadius: 16 }, 70, "out/t2-noheading.png");
// underline style with heading
await still({ ...base, heading: "यस तालिममा", borderStyle: "underline", borderWidth: 4, cornerRadius: 0 }, 70, "out/t2-underline.png");
process.exit(0);
