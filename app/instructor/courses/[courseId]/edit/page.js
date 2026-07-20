import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { findCourseById } from "@/lib/courses";
import { updateCourseAction } from "@/lib/actions/instructorCourses";
import CourseFields from "@/components/CourseFields";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const ERRORS = {
  missing: "Please fill in a title and a price.",
};

export default async function EditCoursePage({ params, searchParams }) {
  const instructor = await requireUser("instructor");
  const { courseId } = await params;
  const search = await searchParams;

  const course = findCourseById(Number(courseId));
  if (!course || course.instructor_id !== instructor.id) {
    redirect("/instructor");
  }

  const errorMessage = ERRORS[search?.error];

  return (
    <main className="grid md:grid-cols-[220px_1fr] flex-1">
      <aside className="bg-burgundy-dark text-gold-pale/80 p-6">
        <div className="flex gap-3 items-center pb-4 mb-4 border-b border-gold/25">
          <div className="medallion w-11 h-11 bg-burgundy-deep border border-gold font-display text-gold-light">
            {instructor.name[0]}
          </div>
          <div>
            <strong className="block text-ivory text-sm font-display">{instructor.name}</strong>
            <span className="text-[0.65rem] uppercase tracking-widest">Instructor</span>
          </div>
        </div>
        <nav className="space-y-1 text-sm">
          <SideLink href="/instructor">Overview</SideLink>
          <SideLink href="/instructor/courses/new">Create New Course</SideLink>
          <SideLink href="/instructor/profile">Edit Profile</SideLink>
        </nav>
      </aside>

      <div className="p-8 bg-cream">
        <div className="mb-7">
          <Link
            href={`/instructor/courses/${course.id}`}
            className="text-xs uppercase tracking-widest text-burgundy/70 hover:text-burgundy"
          >
            ← Manage Lessons
          </Link>
          <span className="block text-xs tracking-[0.2em] uppercase text-burgundy font-medium mt-3">
            Edit Course
          </span>
          <h1 className="font-display text-2xl mt-1">{course.title}</h1>
        </div>

        {errorMessage && (
          <p className="bg-burgundy/10 text-burgundy text-sm px-4 py-3 mb-6 max-w-lg">{errorMessage}</p>
        )}
        {search?.updated === "1" && (
          <p className="bg-emerald-800/10 text-emerald-800 text-sm px-4 py-3 mb-6 max-w-lg">Course updated.</p>
        )}

        <div className="bg-ivory border border-gold/30 p-6 max-w-lg">
          <form action={updateCourseAction} className="flex flex-col gap-3">
            <input type="hidden" name="courseId" value={course.id} />
            <CourseFields levels={LEVELS} course={course} />
            <button
              type="submit"
              className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-5 py-3 self-start mt-1"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function SideLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 border-l-2 ${
        active ? "border-gold-light text-gold-light" : "border-transparent hover:text-ivory"
      }`}
    >
      {children}
    </Link>
  );
}
