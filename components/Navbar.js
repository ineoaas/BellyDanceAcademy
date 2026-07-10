import Link from "next/link";
import Image from "next/image";
import { getCurrentUser, DASHBOARD_BY_ROLE } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";

export default async function Navbar() {
  const user = await getCurrentUser();
  const isLoggedIn = user !== null;
  const dashboardHref = isLoggedIn ? DASHBOARD_BY_ROLE[user.role] ?? "/student" : "/student";
  const firstName = isLoggedIn ? user.name.split(" ")[0] : "";

  return (
    <nav className="sticky top-0 z-50 bg-burgundy-dark border-b-2 border-gold">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-3">
          <div className="medallion w-11 h-11">
            <Image src="/logo.png" alt="Belly Dance Academy" width={44} height={44} />
          </div>
          <div className="font-display text-gold-pale text-base leading-tight">
            Belly Dance
            <span className="block font-script text-2xl leading-none text-gold-light">
              Academy
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-5 flex-wrap">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/courses" className="nav-link">Browse Courses</Link>

          {isLoggedIn && (
            <Link href={dashboardHref} className="nav-link">My Dashboard</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-xs text-gold-pale/70 hidden sm:inline">
                Hi, {firstName}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-xs uppercase tracking-widest text-gold-pale/70 hover:text-gold-pale border border-gold px-4 py-2"
                >
                  Log Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs uppercase tracking-widest text-gold-pale/80 hover:text-gold-pale border border-gold px-4 py-2"
              >
                Log In
              </Link>
              <Link
                href="/login?as=instructor"
                className="text-xs uppercase tracking-widest bg-gold text-burgundy-deep px-4 py-2 font-medium hidden sm:inline-block"
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
