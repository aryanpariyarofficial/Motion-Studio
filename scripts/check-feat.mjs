import path from "path";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), "src", "index.ts") });
async function still(id, props, w, h, frame, out) {
  const c = await selectComposition({ serveUrl, id, inputProps: props });
  await renderStill({ composition: { ...c, width: w, height: h }, serveUrl, output: out, inputProps: props, frame, imageFormat: "png" });
  console.log("wrote", out);
}
// new font (Bebas) in TextAnimation
await still("TextAnimation", { text: "SUMMER SALE", animation: "wordPop", fontKey: "bebas", textColor: "#FFFFFF", bgColor: "#101826", accentColor: "#E8491F", uppercase: true, fontWeight: 800, fontScale: 1, letterSpacingPx: 2, fontSizePx: null, orientation: "square", durationInSeconds: 3 }, 1080, 1080, 40, "out/feat-bebas.png");
// TypingList: check marker + itemFill + heading box + dots bg + dashed border
await still("TypingList", { heading: "FEATURES", items: "Fast rendering\nNepali + English\nMany templates", marker: "check", headingStyle: "box", borderStyle: "dashed", borderWidth: 3, cornerRadius: 12, itemFill: true, activeEmphasis: true, backgroundStyle: "dots", bgColor: "#0B1220", textColor: "#FFFFFF", accentColor: "#3DA9FC", highlightColor: "#3DA9FC", headingColor: "#FFFFFF", fontScale: 1, fontWeight: 700, durationInSeconds: 6 }, 1080, 1350, 120, "out/feat-typing.png");
process.exit(0);
