"use server";

import { getCurrentUser } from "@/lib/auth";
import { findLessonById } from "@/lib/lessons";
import { hasPurchased } from "@/lib/purchases";
import { recordLessonProgress } from "@/lib/progress";

// Called directly from the player (not a form) on a throttled timer while
// a lesson plays. Takes the student's identity from the session, never
// from the caller, same rule as the Phase 2 purchase action.
export async function updateLessonProgressAction({ lessonId, courseId, positionSeconds }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") return;
  if (!hasPurchased(user.id, courseId)) return;

  const lesson = findLessonById(lessonId);
  if (!lesson || lesson.course_id !== courseId) return;

  recordLessonProgress({
    studentId: user.id,
    courseId,
    lessonId,
    positionSeconds,
    durationSeconds: lesson.duration_seconds ?? 0,
  });
}
