import path from "path";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";

const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), "src", "index.ts") });
async function still(props, frame, out) {
  const c = await selectComposition({ serveUrl, id: "Captions", inputProps: props });
  await renderStill({ composition: { ...c, width: 1080, height: 1350 }, serveUrl, output: out, inputProps: props, frame, imageFormat: "png" });
  console.log("wrote", out);
}
const txt = "यो काम साँच्चै राम्रो छ";
const baseDark = { textColor: "#FFFFFF", accentColor: "#E8491F", bgColor: "#101826", boxBehind: false, position: "center", fontScale: 1.1, fontWeight: 800 };
await still({ text: txt, captionStyle: "dynamic", ...baseDark }, 40, "out/cap-dynamic.png");
await still({ text: txt, captionStyle: "box", ...baseDark }, 40, "out/cap-box.png");
process.exit(0);
