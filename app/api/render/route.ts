import path from "path";
import os from "os";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { getTemplate } from "../../../src/studio/templateMeta";

export const runtime = "nodejs";
export const maxDuration = 600;

// cache the bundle across requests so only the first export pays the webpack cost
let serveUrlPromise: Promise<string> | null = null;
function getServeUrl() {
  if (!serveUrlPromise) {
    serveUrlPromise = bundle({
      entryPoint: path.join(process.cwd(), "src", "index.ts"),
      // no special webpack config needed — components use inline styles
    });
  }
  return serveUrlPromise;
}

export async function POST(req: Request) {
  try {
    const { templateId, inputProps, format, width, height, durationInFrames } = await req.json();
    const meta = getTemplate(templateId);
    if (!meta) {
      return Response.json({ error: `Unknown template: ${templateId}` }, { status: 400 });
    }

    const serveUrl = await getServeUrl();
    const selected = await selectComposition({
      serveUrl,
      id: meta.compositionId,
      inputProps,
    });

    // honor the aspect ratio / duration chosen in the UI (Root has fixed dims)
    const composition = {
      ...selected,
      width: typeof width === "number" ? width : selected.width,
      height: typeof height === "number" ? height : selected.height,
      durationInFrames: typeof durationInFrames === "number" ? durationInFrames : selected.durationInFrames,
    };

    const isTransparent = format === "mov";
    const ext = isTransparent ? "mov" : "mp4";
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${templateId}-${stamp}.${ext}`;
    const outputLocation = path.join(process.cwd(), "out", fileName);

    await renderMedia({
      composition,
      serveUrl,
      codec: isTransparent ? "prores" : "h264",
      proResProfile: isTransparent ? "4444" : undefined,
      imageFormat: isTransparent ? "png" : "jpeg",
      crf: isTransparent ? undefined : 18,
      outputLocation,
      inputProps,
      concurrency: Math.max(1, Math.floor(os.cpus().length / 2)),
    });

    return Response.json({ ok: true, file: outputLocation });
  } catch (e: any) {
    console.error(e);
    return Response.json({ error: e?.message ?? "Render failed" }, { status: 500 });
  }
}
