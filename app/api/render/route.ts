import path from "path";
import os from "os";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { getTemplate } from "../../../src/studio/templateMeta";

export const runtime = "nodejs";
export const maxDuration = 600;

// cache the bundle across requests so only the first export pays the webpack cost
let serveUrlPromise: Promise<string> | null = null;
function getServeUrl() {
  if (!serveUrlPromise) {
    serveUrlPromise = bundle({ entryPoint: path.join(process.cwd(), "src", "index.ts") });
  }
  return serveUrlPromise;
}

const FORMATS: Record<string, any> = {
  mp4: { ext: "mp4", codec: "h264", mime: "video/mp4", imageFormat: "jpeg", crf: 18 },
  mov: { ext: "mov", codec: "prores", proResProfile: "4444", mime: "video/quicktime", imageFormat: "png" },
  webm: { ext: "webm", codec: "vp9", pixelFormat: "yuva420p", mime: "video/webm", imageFormat: "png" },
};

export async function POST(req: Request) {
  try {
    const { templateId, compositionId: directId, inputProps, format = "mp4", width, height, durationInFrames } = await req.json();
    const compositionId = directId || getTemplate(templateId)?.compositionId;
    if (!compositionId) {
      return Response.json({ error: `Unknown template: ${templateId}` }, { status: 400 });
    }
    const fmt = FORMATS[format] || FORMATS.mp4;

    const serveUrl = await getServeUrl();
    const selected = await selectComposition({ serveUrl, id: compositionId, inputProps });
    const composition = {
      ...selected,
      width: typeof width === "number" ? width : selected.width,
      height: typeof height === "number" ? height : selected.height,
      durationInFrames: typeof durationInFrames === "number" ? durationInFrames : selected.durationInFrames,
    };

    const tmpDir = path.join(os.tmpdir(), "motionstudio");
    fs.mkdirSync(tmpDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${templateId || compositionId}-${stamp}.${fmt.ext}`;
    const outputLocation = path.join(tmpDir, fileName);

    await renderMedia({
      composition,
      serveUrl,
      codec: fmt.codec,
      proResProfile: fmt.proResProfile,
      pixelFormat: fmt.pixelFormat,
      imageFormat: fmt.imageFormat,
      crf: fmt.crf,
      outputLocation,
      inputProps,
      concurrency: Math.max(1, Math.floor(os.cpus().length / 2)),
    });

    const buf = await fs.promises.readFile(outputLocation);
    fs.promises.unlink(outputLocation).catch(() => {});

    return new Response(buf, {
      headers: {
        "Content-Type": fmt.mime,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(buf.length),
      },
    });
  } catch (e: any) {
    console.error(e);
    return Response.json({ error: e?.message ?? "Render failed" }, { status: 500 });
  }
}
