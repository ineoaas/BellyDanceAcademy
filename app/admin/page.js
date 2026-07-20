import { requireUser } from "@/lib/auth";
import { listPendingInstructorApplications, listAllUsers } from "@/lib/users";
import { listPendingCourses, listLiveCourses } from "@/lib/courses";
import { getPlatformStats } from "@/lib/purchases";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminDashboard() {
  // requireUser redirects to /login (or the right dashboard for the wrong
  // role) before returning, so anything after this line is only reached
  // by an actual logged-in admin.
  const admin = await requireUser("admin");
  const firstName = admin.name.split(" ")[0];

  const applications = listPendingInstructorApplications();
  const pendingCourses = listPendingCourses();
  const totalUsers = listAllUsers().length;
  const activeCourses = listLiveCourses().length;
  const { revenueCents, enrollmentCount } = getPlatformStats();

  return (
    <main className="grid md:grid-cols-[220px_1fr] flex-1">
      <AdminSidebar
        admin={admin}
        active="overview"
        badges={{ applications: applications.length, courses: pendingCourses.length }}
      />

      <div className="p-8 bg-cream">
        <div className="mb-7">
          <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium">Overview</span>
          <h1 className="font-display text-2xl mt-1">Welcome back, {firstName}</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Stat label="Pending Applications" value={applications.length} />
          <Stat label="Pending Courses" value={pendingCourses.length} />
          <Stat label="Total Users" value={totalUsers} />
          <Stat label="Active Courses" value={activeCourses} />
          <Stat label="Platform Revenue" value={`$${(revenueCents / 100).toFixed(2)}`} />
        </div>

        <div className="bg-ivory border border-gold/30 p-6">
          <h3 className="font-display text-lg mb-2">Platform Snapshot</h3>
          <p className="text-sm text-ink/65">
            {enrollmentCount} total enrollment{enrollmentCount === 1 ? "" : "s"} across every course, from
            {" "}{totalUsers} registered users.
          </p>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-ivory border border-gold/30 border-t-2 border-t-gold p-4">
      <span className="text-[0.62rem] uppercase tracking-widest text-ink/55">{label}</span>
      <strong className="block font-display text-2xl text-burgundy mt-1">{value}</strong>
    </div>
  );
}
