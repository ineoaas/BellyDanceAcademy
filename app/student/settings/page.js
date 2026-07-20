import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { updateProfileAction, changePasswordAction } from "@/lib/actions/studentProfile";

const ERRORS = {
  missing: "Please fill in your name and email.",
  exists: "That email is already in use by another account.",
  "wrong-password": "Your current password wasn't right.",
  short: "New password must be at least 8 characters.",
  mismatch: "New passwords don't match.",
};

export default async function StudentSettingsPage({ searchParams }) {
  const user = await requireUser("student");
  const firstName = user.name.split(" ")[0];
  const search = await searchParams;
  const errorMessage = ERRORS[search?.error];

  return (
    <main className="grid md:grid-cols-[220px_1fr] flex-1">
      <aside className="bg-burgundy-dark text-gold-pale/80 p-6">
        <div className="flex gap-3 items-center pb-4 mb-4 border-b border-gold/25">
          <div className="medallion w-11 h-11 bg-burgundy-deep border border-gold font-display text-gold-light">
            {firstName[0]}
          </div>
          <div>
            <strong className="block text-ivory text-sm font-display">{user.name}</strong>
            <span className="text-[0.65rem] uppercase tracking-widest">Student</span>
          </div>
        </div>
        <nav className="space-y-1 text-sm">
          <SideLink href="/student">My Courses</SideLink>
          <SideLink href="/courses">Browse Courses</SideLink>
          <SideLink href="/student/wishlist">Wishlist</SideLink>
          <SideLink href="/student/settings" active>Profile Settings</SideLink>
        </nav>
      </aside>

      <div className="p-8 bg-cream">
        <div className="mb-7">
          <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium">Settings</span>
          <h1 className="font-display text-2xl mt-1">Profile Settings</h1>
        </div>

        {errorMessage && (
          <p className="bg-burgundy/10 text-burgundy text-sm px-4 py-3 mb-6 max-w-md">{errorMessage}</p>
        )}
        {search?.saved === "1" && (
          <p className="bg-emerald-800/10 text-emerald-800 text-sm px-4 py-3 mb-6 max-w-md">Profile updated.</p>
        )}
        {search?.["password-changed"] === "1" && (
          <p className="bg-emerald-800/10 text-emerald-800 text-sm px-4 py-3 mb-6 max-w-md">Password changed.</p>
        )}

        <div className="bg-ivory border border-gold/30 p-6 mb-6 max-w-sm">
          <h3 className="font-display text-lg mb-4">Your Details</h3>
          <form action={updateProfileAction} className="flex flex-col gap-3">
            <label className="text-xs uppercase tracking-widest text-ink/60">
              Name
              <input
                type="text"
                name="name"
                defaultValue={user.name}
                required
                className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
              />
            </label>
            <label className="text-xs uppercase tracking-widest text-ink/60">
              Email
              <input
                type="email"
                name="email"
                defaultValue={user.email}
                required
                className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
              />
            </label>
            <button
              type="submit"
              className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-5 py-3 self-start mt-1"
            >
              Save Changes
            </button>
          </form>
        </div>

        <div className="bg-ivory border border-gold/30 p-6 max-w-sm">
          <h3 className="font-display text-lg mb-4">Change Password</h3>
          <form action={changePasswordAction} className="flex flex-col gap-3">
            <input
              type="password"
              name="currentPassword"
              placeholder="Current password"
              required
              className="border border-gold/40 bg-ivory px-3 py-2 text-sm"
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New password"
              required
              className="border border-gold/40 bg-ivory px-3 py-2 text-sm"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              required
              className="border border-gold/40 bg-ivory px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-5 py-3 self-start mt-1"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function SideLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 border-l-2 ${
        active ? "border-gold-light text-gold-light" : "border-transparent hover:text-ivory"
      }`}
    >
      {children}
    </Link>
  );
}
