import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listPendingInstructorApplications } from "@/lib/users";

// Not built yet — Phase 5 of the roadmap (approvals, course review, user
// management, commissions, payouts, announcements). These stats are
// placeholders until each section lands, same as the mock course data on
// the student/instructor dashboards today.
const PLACEHOLDER_STATS = [
  { label: "Total Users", value: "—" },
  { label: "Active Courses", value: "—" },
  { label: "Platform Revenue", value: "—" },
];

export default async function AdminDashboard() {
  // requireUser redirects to /login (or the right dashboard for the wrong
  // role) before returning, so anything after this line is only reached
  // by an actual logged-in admin.
  const admin = await requireUser("admin");
  const firstName = admin.name.split(" ")[0];
  const applications = listPendingInstructorApplications();

  return (
    <main className="grid md:grid-cols-[220px_1fr] flex-1">
      <aside className="bg-burgundy-dark text-gold-pale/80 p-6">
        <div className="flex gap-3 items-center pb-4 mb-4 border-b border-gold/25">
          <div className="medallion w-11 h-11 bg-burgundy-deep border border-gold font-display text-gold-light">
            {firstName[0]}
          </div>
          <div>
            <strong className="block text-ivory text-sm font-display">{admin.name}</strong>
            <span className="text-[0.65rem] uppercase tracking-widest">Admin</span>
          </div>
        </div>
        <nav className="space-y-1 text-sm">
          <SideLink href="#" active>Overview</SideLink>
          <SideLink href="#">
            Instructor Applications
            {applications.length > 0 && (
              <span className="ml-2 text-[0.6rem] bg-gold text-burgundy-deep px-1.5 py-0.5 font-semibold">
                {applications.length}
              </span>
            )}
          </SideLink>
          <SideLink href="#">Courses</SideLink>
          <SideLink href="#">Users</SideLink>
          <SideLink href="#">Commissions</SideLink>
          <SideLink href="#">Payouts</SideLink>
          <SideLink href="#">Announcements</SideLink>
        </nav>
      </aside>

      <div className="p-8 bg-cream">
        <div className="mb-7">
          <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium">Overview</span>
          <h1 className="font-display text-2xl mt-1">Welcome back, {firstName}</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat label="Pending Applications" value={applications.length} />
          {PLACEHOLDER_STATS.map((stat) => (
            <Stat key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>

        <div className="bg-ivory border border-gold/30 p-6">
          <h3 className="font-display text-lg mb-4">Pending Instructor Applications</h3>
          {applications.length === 0 ? (
            <p className="text-sm text-ink/55">No applications waiting on review.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-widest text-ink/55 border-b border-gold/30">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Applied</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id} className="border-b border-dotted border-gold/30 last:border-none">
                    <td className="py-3 font-medium">{application.name}</td>
                    <td className="py-3">{application.email}</td>
                    <td className="py-3">{formatDate(application.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="text-xs text-ink/45 mt-4">
            Approving and rejecting applications from here is coming soon — for now these are activated manually.
          </p>
        </div>
      </div>
    </main>
  );
}

function formatDate(sqliteDatetime) {
  // SQLite's datetime('now') returns "YYYY-MM-DD HH:MM:SS" in UTC with no
  // timezone marker, so Date needs a bit of help parsing it correctly.
  const date = new Date(sqliteDatetime.replace(" ", "T") + "Z");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Stat({ label, value }) {
  return (
    <div className="bg-ivory border border-gold/30 border-t-2 border-t-gold p-4">
      <span className="text-[0.62rem] uppercase tracking-widest text-ink/55">{label}</span>
      <strong className="block font-display text-2xl text-burgundy mt-1">{value}</strong>
    </div>
  );
}

function SideLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 border-l-2 ${
        active ? "border-gold-light text-gold-light" : "border-transparent hover:text-ivory"
      }`}
    >
      {children}
    </Link>
  );
}
