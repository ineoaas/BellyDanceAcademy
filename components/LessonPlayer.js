"use client";

import { useRef } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { updateLessonProgressAction } from "@/lib/actions/progress";

// How often (in seconds of playback) to report progress — frequent enough
// that "resume" feels accurate, infrequent enough that it isn't hammering
// a server action on every animation frame.
const REPORT_INTERVAL_SECONDS = 10;

export default function LessonPlayer({ lesson, courseId, playbackToken, startTime, trackProgress = false }) {
  const lastReportedRef = useRef(0);

  function reportProgress(currentTime) {
    if (!trackProgress) return;
    updateLessonProgressAction({ lessonId: lesson.id, courseId, positionSeconds: currentTime });
  }

  function handleTimeUpdate(event) {
    const currentTime = event.target.currentTime ?? 0;
    if (currentTime - lastReportedRef.current >= REPORT_INTERVAL_SECONDS) {
      lastReportedRef.current = currentTime;
      reportProgress(currentTime);
    }
  }

  function handleEnded(event) {
    reportProgress(event.target.duration ?? lastReportedRef.current);
  }

  if (!lesson.mux_playback_id) {
    return (
      <div className="aspect-video bg-burgundy-deep flex items-center justify-center text-gold-pale/60 text-sm">
        Video coming soon.
      </div>
    );
  }

  return (
    <MuxPlayer
      playbackId={lesson.mux_playback_id}
      tokens={playbackToken ? { playback: playbackToken } : undefined}
      startTime={startTime || 0}
      streamType="on-demand"
      metadata={{ video_title: lesson.title }}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
      className="w-full aspect-video"
    />
  );
}
