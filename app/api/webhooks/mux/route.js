import { NextResponse } from "next/server";
import mux from "@/lib/mux";
import { setLessonAssetId, markLessonReady, markLessonErrored } from "@/lib/lessons";

// Mux calls this directly over HTTP once it's done processing an upload —
// same webhook-as-source-of-truth pattern as app/api/webhooks/stripe.
// Uploading is instant from the browser's point of view, but transcoding
// happens in the background, so this is the only place that actually
// knows a lesson's video is ready to play.
export async function POST(request) {
  const rawBody = await request.text();

  let event;
  try {
    event = await mux.webhooks.unwrap(rawBody, request.headers, process.env.MUX_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "video.upload.asset_created") {
    const upload = event.data;
    if (upload.asset_id) {
      setLessonAssetId(upload.id, upload.asset_id);
    }
  }

  if (event.type === "video.asset.ready") {
    const asset = event.data;
    const playbackId = asset.playback_ids?.[0]?.id;
    if (playbackId) {
      markLessonReady(asset.id, { playbackId, durationSeconds: asset.duration ?? 0 });
    }
  }

  if (event.type === "video.asset.errored") {
    markLessonErrored(event.data.id);
  }

  return NextResponse.json({ received: true });
}
