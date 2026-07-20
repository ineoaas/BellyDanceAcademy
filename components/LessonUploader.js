"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as UpChunk from "@mux/upchunk";
import { createUploadUrlAction } from "@/lib/actions/instructorLessons";

// Mux transcodes in the background after the upload finishes, so "ready"
// only ever shows up once the webhook (app/api/webhooks/mux) has updated
// this lesson's row — there's no live push to this component, just a
// manual refresh once processing is likely done.
export default function LessonUploader({ lessonId, videoStatus }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const { uploadUrl } = await createUploadUrlAction(lessonId);
      const upload = UpChunk.createUpload({ endpoint: uploadUrl, file });

      upload.on("progress", (e) => setProgress(Math.round(e.detail)));
      upload.on("error", (e) => {
        setError(e.detail?.message ?? "Upload failed");
        setUploading(false);
      });
      upload.on("success", () => {
        setUploading(false);
        router.refresh();
      });
    } catch (err) {
      setError(err.message ?? "Could not start upload");
      setUploading(false);
    }
  }

  if (videoStatus === "ready") {
    return <span className="text-xs text-emerald-800">Video ready</span>;
  }

  if (videoStatus === "processing") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink/55">Processing video&hellip;</span>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="text-[0.65rem] uppercase tracking-widest underline text-ink/55"
        >
          Check status
        </button>
      </div>
    );
  }

  if (uploading) {
    return <span className="text-xs text-ink/55">Uploading&hellip; {progress}%</span>;
  }

  return (
    <div>
      <label className="text-xs uppercase tracking-widest border border-gold px-3 py-2 cursor-pointer">
        Upload Video
        <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
      </label>
      {error && <p className="text-xs text-burgundy mt-1">{error}</p>}
    </div>
  );
}
