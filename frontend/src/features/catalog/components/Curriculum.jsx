import { useState } from "react";
import { formatDuration } from "@/lib/format";
import { LessonPlayer } from "@/features/learning/components/LessonPlayer";

/** Lesson list with inline playback for free previews. */
export function Curriculum({ lessons }) {
  const [previewing, setPreviewing] = useState(null);

  if (lessons.length === 0) return <p className="text-sm text-gold-pale/60">Lessons are on their way.</p>;

  return (
    <div>
      {previewing && (
        <div className="mb-5">
          <LessonPlayer title={previewing.title} playbackId={previewing.previewPlaybackId} />
          <button
            type="button"
            onClick={() => setPreviewing(null)}
            className="mt-2 text-xs tracking-widest text-gold-pale/60 uppercase hover:text-gold-light"
          >
            Close preview
          </button>
        </div>
      )}
      <ol>
        {lessons.map((lesson) => (
          <li
            key={lesson.id}
            className="flex justify-between border-b border-dotted border-gold/30 py-3 text-sm"
          >
            <span>
              <span className="mr-2 font-display text-gold-light italic">{lesson.position}.</span>
              {lesson.title}
            </span>
            <span className="text-xs text-gold-pale/60">
              {formatDuration(lesson.durationSeconds)}
              {lesson.preview &&
                (lesson.previewPlaybackId ? (
                  <button
                    type="button"
                    onClick={() => setPreviewing(lesson)}
                    className="ml-2 text-gold-light hover:underline"
                  >
                    ▶ Preview
                  </button>
                ) : (
                  " · Preview"
                ))}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
