import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listPendingCourses } from "@/lib/courses";
import { approveCourseAction, rejectCourseAction } from "@/lib/actions/admin";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminCoursesPage() {
  const admin = await requireUser("admin");
  const pendingCourses = listPendingCourses();

  return (
    <main className="grid md:grid-cols-[220px_1fr] flex-1">
      <AdminSidebar admin={admin} active="courses" badges={{ courses: pendingCourses.length }} />

      <div className="p-8 bg-cream">
        <div className="mb-7">
          <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium">Courses</span>
          <h1 className="font-display text-2xl mt-1">Pending Course Approvals</h1>
        </div>

        <div className="bg-ivory border border-gold/30 p-6">
          {pendingCourses.length === 0 ? (
            <p className="text-sm text-ink/55">No courses waiting on review.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-widest text-ink/55 border-b border-gold/30">
                  <th className="py-2">Course</th>
                  <th className="py-2">Instructor</th>
                  <th className="py-2">Price</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {pendingCourses.map((course) => (
                  <tr key={course.id} className="border-b border-dotted border-gold/30 last:border-none">
                    <td className="py-3 font-medium">
                      <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                    </td>
                    <td className="py-3">{course.instructor_name}</td>
                    <td className="py-3">${(course.price_cents / 100).toFixed(0)}</td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <form action={approveCourseAction} className="inline">
                        <input type="hidden" name="courseId" value={course.id} />
                        <button
                          type="submit"
                          className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-3 py-2 mr-2"
                        >
                          Approve
                        </button>
                      </form>
                      <form action={rejectCourseAction} className="inline">
                        <input type="hidden" name="courseId" value={course.id} />
                        <button type="submit" className="text-xs uppercase tracking-widest border border-gold px-3 py-2">
                          Reject
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
