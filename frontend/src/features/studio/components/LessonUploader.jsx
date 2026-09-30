import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { studioApi } from "../api";
import { studioKeys } from "../hooks";

/**
 * Uploads a lesson video straight from the browser to Mux (chunked, so
 * large files survive flaky connections). Mux transcodes afterwards; the
 * lessons query polls until its webhook marks the video ready.
 */
export function LessonUploader({ courseId, lesson }) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      const [{ uploadUrl }, UpChunk] = await Promise.all([
        studioApi.startVideoUpload(lesson.id),
        import("@mux/upchunk"),
      ]);
      const upload = UpChunk.createUpload({ endpoint: uploadUrl, file });
      upload.on("progress", (e) => setProgress(Math.round(e.detail)));
      upload.on("error", (e) => {
        setError(e.detail?.message ?? "Upload failed");
        setProgress(null);
      });
      upload.on("success", () => {
        setProgress(null);
        queryClient.invalidateQueries({ queryKey: studioKeys.lessons(courseId) });
      });
    } catch (err) {
      setError(err.message ?? "Could not start upload");
      setProgress(null);
    }
  }

  if (progress !== null) return <span className="text-xs text-ink/55">Uploading… {progress}%</span>;
  if (lesson.videoStatus === "READY") return <span className="text-xs text-emerald-800">Video ready</span>;
  if (lesson.videoStatus === "PROCESSING")
    return <span className="text-xs text-ink/55">Processing video…</span>;

  return (
    <div>
      <label className="cursor-pointer border border-gold px-3 py-2 text-xs tracking-widest uppercase">
        {lesson.videoStatus === "ERRORED" ? "Retry Upload" : "Upload Video"}
        <input type="file" accept="video/*" className="sr-only" onChange={handleFile} />
      </label>
      {lesson.videoStatus === "ERRORED" && !error && (
        <p className="mt-1 text-xs text-burgundy">Processing failed.</p>
      )}
      {error && <p className="mt-1 text-xs text-burgundy">{error}</p>}
    </div>
  );
}
