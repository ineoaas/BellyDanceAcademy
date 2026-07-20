import Link from "next/link";

const NAV_ITEMS = [
  { key: "overview", href: "/admin", label: "Overview" },
  { key: "applications", href: "/admin/applications", label: "Instructor Applications" },
  { key: "courses", href: "/admin/courses", label: "Courses" },
  { key: "reviews", href: "/admin/reviews", label: "Reviews" },
  { key: "users", href: "/admin/users", label: "Users" },
  { key: "commissions", href: "/admin/commissions", label: "Commissions" },
  { key: "payouts", href: "/admin/payouts", label: "Payouts" },
  { key: "announcements", href: "/admin/announcements", label: "Announcements" },
];

// Shared across all eight admin pages — with this many sections, a
// duplicated sidebar per page would be a lot more repetition than the
// small SideLink-per-dashboard pattern elsewhere in the app tolerates.
export default function AdminSidebar({ admin, active, badges = {} }) {
  const firstName = admin.name.split(" ")[0];

  return (
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
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`flex items-center px-3 py-2 border-l-2 ${
              active === item.key ? "border-gold-light text-gold-light" : "border-transparent hover:text-ivory"
            }`}
          >
            {item.label}
            {badges[item.key] > 0 && (
              <span className="ml-2 text-[0.6rem] bg-gold text-burgundy-deep px-1.5 py-0.5 font-semibold">
                {badges[item.key]}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
