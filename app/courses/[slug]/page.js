import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/mockData";
import { getCurrentUser } from "@/lib/auth";
import CourseDetailView from "@/components/CourseDetailView";

export default async function CoursePage({ params }) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return notFound();

  const user = await getCurrentUser();
  const isLoggedInStudent = user?.role === "student";

  return <CourseDetailView course={course} isLoggedInStudent={isLoggedInStudent} />;
}
