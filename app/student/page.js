import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listEnrollmentsForStudent } from "@/lib/purchases";

export default async function StudentDashboard() {
  /* requireUser redirects away non-students, so past this line we're
     always a logged-in student. */
  const user = await requireUser("student");
  const firstName = user.name.split(" ")[0];
  const enrollments = listEnrollmentsForStudent(user.id);

  return (
    <main className="grid md:grid-cols-[220px_1fr] flex-1">
      <aside className="bg-burgundy-dark text-gold-pale/80 p-6">
        <div className="flex gap-3 items-center pb-4 mb-4 border-b border-gold/25">
          <div className="medallion w-11 h-11 bg-burgundy-deep border border-gold font-display text-gold-light">
            {firstName[0]}
          </div>
          <div>
            <strong className="block text-ivory text-sm font-display">{user.name}</strong>
            <span className="text-[0.65rem] uppercase tracking-widest">Student</span>
          </div>
        </div>
        <nav className="space-y-1 text-sm">
          <SideLink href="#" active>My Courses</SideLink>
          <SideLink href="/courses">Browse Courses</SideLink>
          <SideLink href="#">Wishlist</SideLink>
        </nav>
      </aside>

      <div className="p-8 bg-cream">
        <div className="flex justify-between items-start flex-wrap gap-4 mb-7">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium">My Courses</span>
            <h1 className="font-display text-2xl mt-1">Welcome back, {firstName}</h1>
          </div>
          <Link href="/courses" className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-5 py-3">
            Browse More
          </Link>
        </div>

        <div className="bg-ivory border border-gold/30 p-6">
          <h3 className="font-display text-lg mb-4">My Courses</h3>
          {enrollments.length === 0 ? (
            <p className="text-sm text-ink/55">
              You haven&apos;t bought a course yet.{" "}
              <Link href="/courses" className="underline">
                Browse the catalog
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-widest text-ink/55 border-b border-gold/30">
                  <th className="py-2">Course</th>
                  <th className="py-2">Instructor</th>
                  <th className="py-2">Purchased</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-dotted border-gold/30 last:border-none">
                    <td className="py-3 font-medium">{enrollment.title}</td>
                    <td className="py-3">{enrollment.instructor_name}</td>
                    <td className="py-3">{formatDate(enrollment.created_at)}</td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/courses/${enrollment.slug}`}
                        className="text-xs uppercase tracking-widest border border-gold px-3 py-2"
                      >
                        Start Course
                      </Link>
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

function formatDate(sqliteDatetime) {
  /* SQLite's datetime('now') has no timezone marker; force UTC parsing. */
  const date = new Date(sqliteDatetime.replace(" ", "T") + "Z");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
