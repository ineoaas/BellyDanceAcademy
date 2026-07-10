import Link from "next/link";
import { requireUser } from "@/lib/auth";

const WATCHING = [
  { title: "Egyptian Baladi — Foundations", instructor: "Amara Nour", slug: "egyptian-baladi-foundations", progress: 64, status: "In Progress" },
  { title: "Veil Work & Stage Presence", instructor: "Leyla Marín", slug: "veil-work-stage-presence", progress: 22, status: "In Progress" },
  { title: "Arm & Hand Styling Essentials", instructor: "Farah Idris", slug: "arm-hand-styling-essentials", progress: 100, status: "Completed" },
];

export default async function StudentDashboard() {
  // requireUser redirects to /login (or the right dashboard for the wrong
  // role) before returning, so anything after this line is only reached
  // by an actual logged-in student.
  const user = await requireUser("student");
  const firstName = user.name.split(" ")[0];

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
          <h3 className="font-display text-lg mb-4">Continue Watching</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[0.65rem] uppercase tracking-widest text-ink/55 border-b border-gold/30">
                <th className="py-2">Course</th>
                <th className="py-2">Instructor</th>
                <th className="py-2">Progress</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {WATCHING.map((c) => (
                <tr key={c.slug} className="border-b border-dotted border-gold/30 last:border-none">
                  <td className="py-3 font-medium">{c.title}</td>
                  <td className="py-3">{c.instructor}</td>
                  <td className="py-3 w-48">
                    <span className={"inline-block px-2.5 py-1 text-[0.6rem] uppercase font-semibold " + getProgressClasses(c.status)}>
                      {c.status}
                    </span>
                    <div className="h-1 bg-burgundy/10 mt-1.5">
                      <div className="h-full bg-gold" style={{ width: `${c.progress}%` }} />
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <Link href={`/courses/${c.slug}`} className="text-xs uppercase tracking-widest border border-gold px-3 py-2">
                      {getResumeLabel(c.status)}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function getProgressClasses(status) {
  if (status === "Completed") {
    return "bg-emerald-800/10 text-emerald-800";
  }
  return "bg-gold/20 text-[#7A5D1D]";
}

function getResumeLabel(status) {
  if (status === "Completed") {
    return "Rewatch";
  }
  return "Resume";
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
