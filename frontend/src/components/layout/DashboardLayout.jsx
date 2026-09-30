import { NavLink, Outlet } from "react-router";
import { Medallion } from "@/components/ui";
import { useCurrentUser } from "@/features/auth/hooks";
import { ROLE_LABELS } from "@/lib/labels";

/**
 * Sidebar + content shell shared by the student, instructor and admin areas.
 *
 * @param links [{ to, label, end?, badge? }]
 */
export function DashboardLayout({ links }) {
  const user = useCurrentUser();

  return (
    <main className="grid flex-1 md:grid-cols-[220px_1fr]">
      <aside className="bg-burgundy-dark p-6 text-gold-pale/80">
        <div className="mb-4 flex items-center gap-3 border-b border-gold/25 pb-4">
          <Medallion text={user.name} size="sm" className="border border-gold bg-burgundy-deep text-gold-light" />
          <div>
            <strong className="block font-display text-sm text-ivory">{user.name}</strong>
            <span className="text-[0.65rem] tracking-widest uppercase">{ROLE_LABELS[user.role]}</span>
          </div>
        </div>
        <nav className="space-y-1 text-sm">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center border-l-2 px-3 py-2 ${
                  isActive ? "border-gold-light text-gold-light" : "border-transparent hover:text-ivory"
                }`
              }
            >
              {link.label}
              {link.badge > 0 && (
                <span className="ml-2 bg-gold px-1.5 py-0.5 text-[0.6rem] font-semibold text-burgundy-deep">
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 bg-cream p-8">
        <Outlet />
      </div>
    </main>
  );
}
