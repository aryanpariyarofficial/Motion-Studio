import path from "path";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";

const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), "src", "index.ts") });

async function still(id, inputProps, w, h, frame, out) {
  const c = await selectComposition({ serveUrl, id, inputProps });
  await renderStill({ composition: { ...c, width: w, height: h }, serveUrl, output: out, inputProps, frame, imageFormat: "png" });
  console.log("wrote", out);
}

await still("Captions", { text: "यो प्रोडक्ट साँच्चै राम्रो छ", textColor: "#FFFFFF", accentColor: "#E8491F", bgColor: "#101826", boxBehind: true, position: "center", fontScale: 1, fontWeight: 800, durationInSeconds: 3 }, 1080, 1920, 55, "out/new-captions.png");

await still("OfferCard", { headline: "50% OFF", subtitle: "On all renovation packages this month", ctaText: "ORDER NOW", bgColor: "#0E3A33", primaryColor: "#1A5C4F", accentColor: "#E8491F", textColor: "#FFFFFF", fontScale: 1, fontWeight: 900, durationInSeconds: 3 }, 1920, 1080, 55, "out/new-offer.png");

await still("LowerThird", { title: "AASHRAY Construction", subtitle: "Renovation & Interior Experts", side: "left", barColor: "#0E3A33", accentColor: "#E8491F", textColor: "#FFFFFF", fontScale: 1, fontWeight: 800, durationInSeconds: 4 }, 1920, 1080, 40, "out/new-lowerthird.png");

await still("ReviewCard", { quote: "Excellent work, finished on time and on budget!", name: "Sita Sharma", rating: 5, bgColor: "#F1EBE1", primaryColor: "#0E3A33", accentColor: "#E8491F", textColor: "#0E3A33", fontScale: 1, durationInSeconds: 4 }, 1080, 1080, 70, "out/new-review.png");

process.exit(0);
