import { lazy, Suspense, useRef } from "react";

// The player is large; load it only when a video is actually shown.
const MuxPlayer = lazy(() => import("@mux/mux-player-react"));

/** How often, in seconds of playback, to report progress. */
const REPORT_INTERVAL_SECONDS = 10;

function VideoPlaceholder({ children }) {
  return (
    <div className="flex aspect-video items-center justify-center bg-burgundy-dark text-sm text-gold-pale/60">
      {children}
    </div>
  );
}

/**
 * @param playbackToken required for paid lessons, absent for previews
 * @param onProgress    called with the position (seconds) every few seconds of playback and on end
 */
export function LessonPlayer({ title, playbackId, playbackToken, startTime = 0, onProgress }) {
  const lastReported = useRef(0);

  if (!playbackId) return <VideoPlaceholder>Video coming soon.</VideoPlaceholder>;

  function handleTimeUpdate(event) {
    const currentTime = event.target.currentTime ?? 0;
    if (onProgress && Math.abs(currentTime - lastReported.current) >= REPORT_INTERVAL_SECONDS) {
      lastReported.current = currentTime;
      onProgress(currentTime);
    }
  }

  function handleEnded(event) {
    onProgress?.(event.target.duration ?? lastReported.current);
  }

  return (
    <Suspense fallback={<VideoPlaceholder>Loading player…</VideoPlaceholder>}>
      <MuxPlayer
        playbackId={playbackId}
        tokens={playbackToken ? { playback: playbackToken } : undefined}
        startTime={startTime}
        streamType="on-demand"
        metadata={{ video_title: title }}
        accentColor="#b8912f"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="aspect-video w-full"
      />
    </Suspense>
  );
}
