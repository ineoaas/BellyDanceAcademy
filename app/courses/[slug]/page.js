import { notFound } from "next/navigation";
import { findCourseBySlug, getLessonsForCourse, formatCourseForDisplay } from "@/lib/courses";
import { hasPurchased } from "@/lib/purchases";
import { getCurrentUser } from "@/lib/auth";
import CourseDetailView from "@/components/CourseDetailView";

export default async function CoursePage({ params, searchParams }) {
  const { slug } = await params;
  const search = await searchParams;

  const course = findCourseBySlug(slug);
  if (!course || course.status !== "live") return notFound();

  const user = await getCurrentUser();
  const alreadyPurchased = user?.role === "student" ? hasPurchased(user.id, course.id) : false;

  const lessons = getLessonsForCourse(course.id);
  const displayCourse = {
    ...formatCourseForDisplay(course),
    curriculum: lessons.map((lesson) => ({
      title: lesson.title,
      time: lesson.duration_label,
      preview: Boolean(lesson.is_preview),
    })),
  };

  return (
    <CourseDetailView
      course={displayCourse}
      alreadyPurchased={alreadyPurchased}
      purchaseError={search?.error === "unavailable"}
      checkoutCancelled={search?.checkout === "cancelled"}
    />
  );
}
