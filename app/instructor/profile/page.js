import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { findProfileByUserId } from "@/lib/instructorProfiles";
import { updateInstructorProfileAction } from "@/lib/actions/instructorProfile";

export default async function InstructorProfilePage({ searchParams }) {
  const instructor = await requireUser("instructor");
  const search = await searchParams;
  const profile = findProfileByUserId(instructor.id);

  return (
    <main className="grid md:grid-cols-[220px_1fr] flex-1">
      <aside className="bg-burgundy-dark text-gold-pale/80 p-6">
        <div className="flex gap-3 items-center pb-4 mb-4 border-b border-gold/25">
          <div className="medallion w-11 h-11 bg-burgundy-deep border border-gold font-display text-gold-light">
            {instructor.name[0]}
          </div>
          <div>
            <strong className="block text-ivory text-sm font-display">{instructor.name}</strong>
            <span className="text-[0.65rem] uppercase tracking-widest">Instructor</span>
          </div>
        </div>
        <nav className="space-y-1 text-sm">
          <SideLink href="/instructor">Overview</SideLink>
          <SideLink href="/instructor/courses/new">Create New Course</SideLink>
          <SideLink href="/instructor/profile" active>Edit Profile</SideLink>
        </nav>
      </aside>

      <div className="p-8 bg-cream">
        <div className="flex justify-between items-start flex-wrap gap-4 mb-7">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium">Profile</span>
            <h1 className="font-display text-2xl mt-1">Edit Your Instructor Profile</h1>
          </div>
          {profile && (
            <Link
              href={`/instructors/${profile.slug}`}
              className="text-xs uppercase tracking-widest border border-gold px-4 py-2"
            >
              View Public Profile
            </Link>
          )}
        </div>

        {search?.saved === "1" && (
          <p className="bg-emerald-800/10 text-emerald-800 text-sm px-4 py-3 mb-6 max-w-lg">Profile saved.</p>
        )}
        {!profile && (
          <p className="text-sm text-ink/55 mb-6 max-w-lg">
            You don&apos;t have a public profile yet — save one below to appear on the Instructors page.
          </p>
        )}

        <div className="bg-ivory border border-gold/30 p-6 max-w-lg">
          <form action={updateInstructorProfileAction} className="flex flex-col gap-3">
            <label className="text-xs uppercase tracking-widest text-ink/60">
              City
              <input
                type="text"
                name="city"
                defaultValue={profile?.city ?? ""}
                placeholder="Cairo, Egypt"
                className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
              />
            </label>
            <label className="text-xs uppercase tracking-widest text-ink/60">
              Credentials
              <input
                type="text"
                name="credentials"
                defaultValue={profile?.credentials ?? ""}
                placeholder="10+ years performing, Cairo"
                className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
              />
            </label>
            <label className="text-xs uppercase tracking-widest text-ink/60">
              Bio
              <textarea
                name="bio"
                rows={5}
                defaultValue={profile?.bio ?? ""}
                placeholder="Tell students about your background and teaching style."
                className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
              />
            </label>
            <button
              type="submit"
              className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-5 py-3 self-start mt-1"
            >
              Save Profile
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
