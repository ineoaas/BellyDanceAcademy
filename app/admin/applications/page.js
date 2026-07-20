import { requireUser } from "@/lib/auth";
import { listPendingInstructorApplications } from "@/lib/users";
import { approveApplicationAction, rejectApplicationAction } from "@/lib/actions/admin";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminApplicationsPage() {
  const admin = await requireUser("admin");
  const applications = listPendingInstructorApplications();

  return (
    <main className="grid md:grid-cols-[220px_1fr] flex-1">
      <AdminSidebar admin={admin} active="applications" badges={{ applications: applications.length }} />

      <div className="p-8 bg-cream">
        <div className="mb-7">
          <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium">Applications</span>
          <h1 className="font-display text-2xl mt-1">Pending Instructor Applications</h1>
        </div>

        <div className="bg-ivory border border-gold/30 p-6">
          {applications.length === 0 ? (
            <p className="text-sm text-ink/55">No applications waiting on review.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-widest text-ink/55 border-b border-gold/30">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Applied</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id} className="border-b border-dotted border-gold/30 last:border-none">
                    <td className="py-3 font-medium">{application.name}</td>
                    <td className="py-3">{application.email}</td>
                    <td className="py-3">{formatDate(application.created_at)}</td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <form action={approveApplicationAction} className="inline">
                        <input type="hidden" name="userId" value={application.id} />
                        <button
                          type="submit"
                          className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-3 py-2 mr-2"
                        >
                          Approve
                        </button>
                      </form>
                      <form action={rejectApplicationAction} className="inline">
                        <input type="hidden" name="userId" value={application.id} />
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

function formatDate(sqliteDatetime) {
  // SQLite's datetime('now') returns "YYYY-MM-DD HH:MM:SS" in UTC with no
  // timezone marker, so Date needs a bit of help parsing it correctly.
  const date = new Date(sqliteDatetime.replace(" ", "T") + "Z");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
