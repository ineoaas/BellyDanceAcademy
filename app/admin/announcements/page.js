import { requireUser } from "@/lib/auth";
import { listAllAnnouncements } from "@/lib/announcements";
import { createAnnouncementAction, toggleAnnouncementAction } from "@/lib/actions/admin";
import AdminSidebar from "@/components/AdminSidebar";

const ERRORS = {
  missing: "Write a message before publishing.",
};

export default async function AdminAnnouncementsPage({ searchParams }) {
  const admin = await requireUser("admin");
  const search = await searchParams;
  const announcements = listAllAnnouncements();
  const errorMessage = ERRORS[search?.error];

  return (
    <main className="grid md:grid-cols-[220px_1fr] flex-1">
      <AdminSidebar admin={admin} active="announcements" />

      <div className="p-8 bg-cream">
        <div className="mb-7">
          <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium">Announcements</span>
          <h1 className="font-display text-2xl mt-1">Site-Wide Announcements</h1>
        </div>

        {errorMessage && (
          <p className="bg-burgundy/10 text-burgundy text-sm px-4 py-3 mb-6 max-w-lg">{errorMessage}</p>
        )}

        <div className="bg-ivory border border-gold/30 p-6 mb-6 max-w-lg">
          <h3 className="font-display text-lg mb-4">Publish a New Announcement</h3>
          <form action={createAnnouncementAction} className="flex flex-col gap-3">
            <textarea
              name="message"
              rows={3}
              required
              placeholder="e.g. We'll be doing scheduled maintenance Sunday at 2am UTC."
              className="border border-gold/40 bg-ivory px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-5 py-3 self-start"
            >
              Publish
            </button>
          </form>
        </div>

        <div className="bg-ivory border border-gold/30 p-6">
          <h3 className="font-display text-lg mb-4">All Announcements</h3>
          {announcements.length === 0 ? (
            <p className="text-sm text-ink/55">Nothing published yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-widest text-ink/55 border-b border-gold/30">
                  <th className="py-2">Message</th>
                  <th className="py-2">Status</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => (
                  <tr key={announcement.id} className="border-b border-dotted border-gold/30 last:border-none">
                    <td className="py-3 max-w-md">{announcement.message}</td>
                    <td className="py-3">
                      <span
                        className={
                          "inline-block px-2.5 py-1 text-[0.6rem] uppercase font-semibold " +
                          (announcement.is_active
                            ? "bg-emerald-800/10 text-emerald-800"
                            : "bg-gold/20 text-[#7A5D1D]")
                        }
                      >
                        {announcement.is_active ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <form action={toggleAnnouncementAction}>
                        <input type="hidden" name="id" value={announcement.id} />
                        <input type="hidden" name="isActive" value={announcement.is_active ? "0" : "1"} />
                        <button type="submit" className="text-xs uppercase tracking-widest border border-gold px-3 py-2">
                          {announcement.is_active ? "Deactivate" : "Activate"}
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
