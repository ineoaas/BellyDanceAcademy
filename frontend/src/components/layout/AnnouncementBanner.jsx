import { useActiveAnnouncements } from "@/features/announcements/hooks";

/** Site-wide banner under the navbar. Renders nothing while loading or when empty. */
export function AnnouncementBanner() {
  const { data: announcements = [] } = useActiveAnnouncements();
  if (announcements.length === 0) return null;

  return (
    <div className="bg-gold text-center text-sm text-burgundy-deep">
      {announcements.map((announcement) => (
        <p key={announcement.id} className="mx-auto max-w-5xl px-6 py-2">
          {announcement.message}
        </p>
      ))}
    </div>
  );
}
