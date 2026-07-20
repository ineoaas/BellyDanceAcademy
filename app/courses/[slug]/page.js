import { notFound } from "next/navigation";
import { findCourseBySlug, getLessonsForCourse, formatCourseForDisplay } from "@/lib/courses";
import { hasPurchased } from "@/lib/purchases";
import { getCurrentUser } from "@/lib/auth";
import { findProfileByUserId } from "@/lib/instructorProfiles";
import { listVisibleReviewsForCourse, findReviewByStudent } from "@/lib/reviews";
import { isWishlisted } from "@/lib/wishlist";
import CourseDetailView from "@/components/CourseDetailView";

export default async function CoursePage({ params, searchParams }) {
  const { slug } = await params;
  const search = await searchParams;

  const course = findCourseBySlug(slug);
  if (!course || course.status !== "live") return notFound();

  const user = await getCurrentUser();
  const isStudent = user?.role === "student";
  const alreadyPurchased = isStudent ? hasPurchased(user.id, course.id) : false;

  const lessons = getLessonsForCourse(course.id);
  const instructorProfile = findProfileByUserId(course.instructor_id);
  const reviews = listVisibleReviewsForCourse(course.id);
  const existingReview = isStudent ? findReviewByStudent(user.id, course.id) : null;
  const wishlisted = isStudent ? isWishlisted(user.id, course.id) : false;

  const displayCourse = {
    ...formatCourseForDisplay(course),
    instructorSlug: instructorProfile?.slug ?? null,
    curriculum: lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      time: lesson.duration_label,
      preview: Boolean(lesson.is_preview),
      muxPlaybackId: lesson.is_preview ? lesson.mux_playback_id : null,
    })),
  };

  return (
    <CourseDetailView
      course={displayCourse}
      alreadyPurchased={alreadyPurchased}
      isLoggedInStudent={isStudent}
      reviews={reviews}
      existingReview={existingReview}
      wishlisted={wishlisted}
      purchaseError={search?.error === "unavailable"}
      checkoutCancelled={search?.checkout === "cancelled"}
      lockedError={search?.error === "locked"}
      reviewed={search?.reviewed === "1"}
    />
  );
}
