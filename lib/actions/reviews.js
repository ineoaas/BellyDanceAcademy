"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { findCourseById } from "@/lib/courses";
import { findPurchaseForStudent } from "@/lib/purchases";
import { upsertReview } from "@/lib/reviews";

// Only a verified purchaser can post — enforced server-side by requiring
// an actual purchase row, never trusting a client-side "I bought this" flag.
export async function submitReviewAction(formData) {
  const courseId = Number(formData.get("courseId"));
  const course = findCourseById(courseId);
  if (!course) redirect("/courses");

  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    redirect(`/login?as=student&redirect=/courses/${course.slug}`);
  }

  const purchase = findPurchaseForStudent(user.id, courseId);
  if (!purchase) redirect(`/courses/${course.slug}`);

  const rating = Number(formData.get("rating"));
  const comment = formData.get("comment")?.toString().trim() ?? "";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect(`/courses/${course.slug}`);
  }

  upsertReview({ studentId: user.id, courseId, purchaseId: purchase.id, rating, comment });
  redirect(`/courses/${course.slug}?reviewed=1`);
}
