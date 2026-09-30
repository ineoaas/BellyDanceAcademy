import { Link, NavLink, useNavigate } from "react-router";
import { useLogout, useSession } from "@/features/auth/hooks";
import { firstName } from "@/lib/format";
import { DASHBOARD_PATH } from "@/lib/labels";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/courses", label: "Browse Courses" },
  { to: "/instructors", label: "Instructors" },
  { to: "/about", label: "About" },
];

export function Navbar() {
  const { data: user } = useSession();
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-gold bg-burgundy-dark">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="medallion h-11 w-11">
            <img src="/logo.png" alt="" width={44} height={44} />
          </div>
          <div className="font-display text-base leading-tight text-gold-pale">
            Belly Dance
            <span className="block font-script text-2xl leading-none text-gold-light">Academy</span>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-5">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="nav-link">
              {link.label}
            </NavLink>
          ))}
          {user && (
            <NavLink to={DASHBOARD_PATH[user.role]} className="nav-link">
              My Dashboard
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-xs text-gold-pale/70 sm:inline">Hi, {firstName(user.name)}</span>
              <button
                type="button"
                onClick={() => logout.mutate(undefined, { onSuccess: () => navigate("/") })}
                disabled={logout.isPending}
                className="border border-gold px-4 py-2 text-xs tracking-widest text-gold-pale/70 uppercase hover:text-gold-pale"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="border border-gold px-4 py-2 text-xs tracking-widest text-gold-pale/80 uppercase hover:text-gold-pale"
              >
                Log In
              </Link>
              <Link
                to="/become-an-instructor"
                className="hidden bg-gold px-4 py-2 text-xs font-medium tracking-widest text-burgundy-deep uppercase sm:inline-block"
              >
                Become an Instructor
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
