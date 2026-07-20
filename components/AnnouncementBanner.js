import { listActiveAnnouncements } from "@/lib/announcements";

// Async server component rendered straight into the root layout, below
// the Navbar — this is what makes an announcement genuinely site-wide
// (FR-5.8) rather than living on one page.
export default async function AnnouncementBanner() {
  const announcements = listActiveAnnouncements();
  if (announcements.length === 0) return null;

  return (
    <div className="bg-gold text-burgundy-deep text-sm text-center">
      {announcements.map((announcement) => (
        <p key={announcement.id} className="max-w-5xl mx-auto px-6 py-2">
          {announcement.message}
        </p>
      ))}
    </div>
  );
}
