"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { findCourseById } from "@/lib/courses";
import { toggleWishlistItem } from "@/lib/wishlist";

export async function toggleWishlistAction(formData) {
  const courseId = Number(formData.get("courseId"));
  const course = findCourseById(courseId);
  if (!course) redirect("/courses");

  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    redirect(`/login?as=student&redirect=/courses/${course.slug}`);
  }

  toggleWishlistItem(user.id, courseId);
  // Defaults to the course page (where the toggle first shipped); the
  // wishlist page passes its own path so removing an item doesn't bounce
  // you away to that course.
  redirect(formData.get("returnTo")?.toString() || `/courses/${course.slug}`);
}
