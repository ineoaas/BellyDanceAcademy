"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { findCourseById, createCourse, updateCourse } from "@/lib/courses";

// Same ownership-check pattern as lib/actions/instructorLessons.js.
function requireOwnedCourse(instructor, courseId) {
  const course = findCourseById(courseId);
  if (!course || course.instructor_id !== instructor.id) {
    redirect("/instructor");
  }
  return course;
}

function readCourseFields(formData) {
  return {
    title: formData.get("title")?.toString().trim() ?? "",
    description: formData.get("description")?.toString().trim() ?? "",
    about: formData.get("about")?.toString().trim() ?? "",
    level: formData.get("level")?.toString() ?? "Beginner",
    style: formData.get("style")?.toString().trim() ?? "",
    durationLabel: formData.get("durationLabel")?.toString().trim() ?? "",
    price: Number(formData.get("price")),
    originalPrice: formData.get("originalPrice") ? Number(formData.get("originalPrice")) : null,
  };
}

// New courses start `pending` (lib/courses.js's createCourse) — they need
// an admin's approval at /admin/courses before they're publicly visible.
export async function createCourseAction(formData) {
  const instructor = await requireUser("instructor");
  const fields = readCourseFields(formData);

  if (!fields.title || !fields.price) {
    redirect("/instructor/courses/new?error=missing");
  }

  const course = createCourse({ instructorId: instructor.id, ...fields });
  redirect(`/instructor/courses/${course.id}?created=1`);
}

// Editing a live course does not reset its status — see the note in
// lib/courses.js's updateCourse.
export async function updateCourseAction(formData) {
  const instructor = await requireUser("instructor");
  const courseId = Number(formData.get("courseId"));
  requireOwnedCourse(instructor, courseId);

  const fields = readCourseFields(formData);
  if (!fields.title || !fields.price) {
    redirect(`/instructor/courses/${courseId}/edit?error=missing`);
  }

  updateCourse(courseId, fields);
  redirect(`/instructor/courses/${courseId}?updated=1`);
}
