"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const { session, logout, ready } = useAuth();

  // While ready is false we don't know yet if someone is logged in,
  // so we treat them as logged out until the check finishes.
  const isLoggedIn = ready && session !== null;

  let dashboardHref = "/student";
  if (isLoggedIn && session.role === "instructor") {
    dashboardHref = "/instructor";
  }

  let firstName = "";
  if (isLoggedIn) {
    firstName = session.name.split(" ")[0];
  }

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
              <button
                onClick={logout}
                className="text-xs uppercase tracking-widest text-gold-pale/70 hover:text-gold-pale border border-gold px-4 py-2"
              >
                Log Out
              </button>
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
