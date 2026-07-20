import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { findCourseById, getLessonsForCourse } from "@/lib/courses";
import { createLessonAction, reorderLessonAction } from "@/lib/actions/instructorLessons";
import LessonUploader from "@/components/LessonUploader";

export default async function ManageLessonsPage({ params }) {
  const instructor = await requireUser("instructor");
  const { courseId } = await params;

  const course = findCourseById(Number(courseId));
  if (!course || course.instructor_id !== instructor.id) {
    redirect("/instructor");
  }

  const lessons = getLessonsForCourse(course.id);

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
          <SideLink href="/instructor" active>My Courses</SideLink>
        </nav>
      </aside>

      <div className="p-8 bg-cream">
        <div className="flex justify-between items-start flex-wrap gap-4 mb-7">
          <div>
            <Link href="/instructor" className="text-xs uppercase tracking-widest text-burgundy/70 hover:text-burgundy">
              ← Back to Dashboard
            </Link>
            <span className="block text-xs tracking-[0.2em] uppercase text-burgundy font-medium mt-3">
              Manage Lessons
            </span>
            <h1 className="font-display text-2xl mt-1">{course.title}</h1>
          </div>
          <Link
            href={`/instructor/courses/${course.id}/edit`}
            className="text-xs uppercase tracking-widest border border-gold px-4 py-2"
          >
            Edit Course Details
          </Link>
        </div>

        <div className="bg-ivory border border-gold/30 p-6 mb-6">
          <h3 className="font-display text-lg mb-4">Lessons</h3>
          {lessons.length === 0 ? (
            <p className="text-sm text-ink/55 mb-4">No lessons yet — add the first one below.</p>
          ) : (
            <table className="w-full text-sm mb-2">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-widest text-ink/55 border-b border-gold/30">
                  <th className="py-2">#</th>
                  <th className="py-2">Title</th>
                  <th className="py-2">Duration</th>
                  <th className="py-2">Preview</th>
                  <th className="py-2">Video</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson, index) => (
                  <tr key={lesson.id} className="border-b border-dotted border-gold/30 last:border-none">
                    <td className="py-3">{lesson.position}</td>
                    <td className="py-3 font-medium">{lesson.title}</td>
                    <td className="py-3">{lesson.duration_label || "—"}</td>
                    <td className="py-3">{lesson.is_preview ? "Yes" : "—"}</td>
                    <td className="py-3">
                      <LessonUploader lessonId={lesson.id} videoStatus={lesson.video_status} />
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <form action={reorderLessonAction} className="inline">
                        <input type="hidden" name="lessonId" value={lesson.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          disabled={index === 0}
                          className="text-xs px-2 disabled:opacity-30"
                        >
                          ↑
                        </button>
                      </form>
                      <form action={reorderLessonAction} className="inline">
                        <input type="hidden" name="lessonId" value={lesson.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          disabled={index === lessons.length - 1}
                          className="text-xs px-2 disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-ivory border border-gold/30 p-6">
          <h3 className="font-display text-lg mb-4">Add Lesson</h3>
          <form action={createLessonAction} className="flex flex-col gap-3 max-w-sm">
            <input type="hidden" name="courseId" value={course.id} />
            <input
              type="text"
              name="title"
              placeholder="Lesson title"
              required
              className="border border-gold/40 bg-ivory px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" name="isPreview" />
              Playable as a free preview
            </label>
            <button
              type="submit"
              className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-5 py-3 self-start"
            >
              Add Lesson
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
