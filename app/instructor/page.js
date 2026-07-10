import Link from "next/link";
import { requireUser } from "@/lib/auth";

const MY_COURSES = [
  { title: "Egyptian Baladi — Foundations", status: "Live", students: 3200, revenue: "$18,880" },
  { title: "Saidi & the Cane Dance", status: "Live", students: 212, revenue: "$4,240" },
  { title: "Layered Rhythm: Baladi II", status: "In Review", students: "—", revenue: "—" },
];

const PAYOUTS = [
  { date: "Jun 30, 2026", amount: "$2,110" },
  { date: "May 31, 2026", amount: "$1,860" },
];

export default async function InstructorDashboard() {
  // requireUser redirects to /login (or the right dashboard for the wrong
  // role) before returning, so anything after this line is only reached
  // by an actual logged-in instructor.
  const user = await requireUser("instructor");
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
            <span className="text-[0.65rem] uppercase tracking-widest">Instructor</span>
          </div>
        </div>
        <nav className="space-y-1 text-sm">
          <SideLink href="#" active>Overview</SideLink>
          <SideLink href="#">My Courses</SideLink>
          <SideLink href="#">Upload New Course</SideLink>
          <SideLink href="#">Payouts</SideLink>
        </nav>
      </aside>

      <div className="p-8 bg-cream">
        <div className="flex justify-between items-start flex-wrap gap-4 mb-7">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium">Overview</span>
            <h1 className="font-display text-2xl mt-1">Welcome back, {firstName}</h1>
          </div>
          <button className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-5 py-3">
            + Upload Course
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat label="Total Revenue" value="$24,860" delta="▲ 12% this month" />
          <Stat label="Students Enrolled" value="3,412" delta="▲ 8% this month" />
          <Stat label="Active Courses" value="6" />
          <Stat label="Available for Payout" value="$1,940" />
        </div>

        <div className="bg-ivory border border-gold/30 p-6 mb-6">
          <h3 className="font-display text-lg mb-4">My Courses</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[0.65rem] uppercase tracking-widest text-ink/55 border-b border-gold/30">
                <th className="py-2">Course</th>
                <th className="py-2">Status</th>
                <th className="py-2">Students</th>
                <th className="py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {MY_COURSES.map((c) => (
                <tr key={c.title} className="border-b border-dotted border-gold/30 last:border-none">
                  <td className="py-3 font-medium">{c.title}</td>
                  <td className="py-3">
                    <span className={"inline-block px-2.5 py-1 text-[0.6rem] uppercase font-semibold " + getCourseStatusClasses(c.status)}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3">{c.students}</td>
                  <td className="py-3">{c.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-ivory border border-gold/30 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-lg">Payout History</h3>
            <button className="text-xs uppercase tracking-widest border border-gold px-4 py-2">Request Payout</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[0.65rem] uppercase tracking-widest text-ink/55 border-b border-gold/30">
                <th className="py-2">Date</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {PAYOUTS.map((p) => (
                <tr key={p.date} className="border-b border-dotted border-gold/30 last:border-none">
                  <td className="py-3">{p.date}</td>
                  <td className="py-3">{p.amount}</td>
                  <td className="py-3">
                    <span className="inline-block px-2.5 py-1 text-[0.6rem] uppercase font-semibold bg-emerald-800/10 text-emerald-800">
                      Paid
                    </span>
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

function getCourseStatusClasses(status) {
  if (status === "Live") {
    return "bg-burgundy/10 text-burgundy";
  }
  return "bg-gold/20 text-[#7A5D1D]";
}

function Stat({ label, value, delta }) {
  return (
    <div className="bg-ivory border border-gold/30 border-t-2 border-t-gold p-4">
      <span className="text-[0.62rem] uppercase tracking-widest text-ink/55">{label}</span>
      <strong className="block font-display text-2xl text-burgundy mt-1">{value}</strong>
      {delta && <small className="text-gold font-medium">{delta}</small>}
    </div>
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
