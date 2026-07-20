"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { findCourseById } from "@/lib/courses";
import { createLesson, swapLessonPosition, setLessonUploadId, findLessonById } from "@/lib/lessons";
import mux from "@/lib/mux";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

// Every action here re-checks that the course actually belongs to the
// logged-in instructor — the Manage Lessons page URL is just a course id,
// so nothing stops someone from typing a different one in.
function requireOwnedCourse(instructor, courseId) {
  const course = findCourseById(courseId);
  if (!course || course.instructor_id !== instructor.id) {
    redirect("/instructor");
  }
  return course;
}

export async function createLessonAction(formData) {
  const instructor = await requireUser("instructor");
  const courseId = Number(formData.get("courseId"));
  const course = requireOwnedCourse(instructor, courseId);

  const title = formData.get("title")?.toString().trim() ?? "";
  const isPreview = formData.get("isPreview") === "on";
  if (!title) redirect(`/instructor/courses/${course.id}`);

  createLesson({ courseId: course.id, title, durationLabel: "", isPreview });
  redirect(`/instructor/courses/${course.id}`);
}

export async function reorderLessonAction(formData) {
  const instructor = await requireUser("instructor");
  const lessonId = Number(formData.get("lessonId"));
  const direction = formData.get("direction")?.toString();

  const lesson = findLessonById(lessonId);
  if (!lesson) redirect("/instructor");
  const course = requireOwnedCourse(instructor, lesson.course_id);

  swapLessonPosition(lessonId, direction === "up" ? "up" : "down");
  redirect(`/instructor/courses/${course.id}`);
}

// Called directly from the client uploader (not a form submit) — it needs
// to return the upload URL so the browser can start sending the file
// straight to Mux, so a redirect-based action wouldn't work here.
export async function createUploadUrlAction(lessonId) {
  const instructor = await requireUser("instructor");
  const lesson = findLessonById(lessonId);
  if (!lesson) throw new Error("Lesson not found");
  requireOwnedCourse(instructor, lesson.course_id);

  // Preview lessons stay publicly playable (that's the point of a
  // preview); everything else is gated behind a signed playback token.
  const playbackPolicies = lesson.is_preview ? ["public"] : ["signed"];

  const upload = await mux.video.uploads.create({
    cors_origin: APP_URL,
    new_asset_settings: { playback_policies: playbackPolicies },
  });

  setLessonUploadId(lessonId, upload.id);
  return { uploadUrl: upload.url };
}
