import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listWishlistForStudent } from "@/lib/wishlist";
import { toggleWishlistAction } from "@/lib/actions/wishlist";

export default async function WishlistPage() {
  const user = await requireUser("student");
  const firstName = user.name.split(" ")[0];
  const items = listWishlistForStudent(user.id);

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
          <SideLink href="/student/wishlist" active>Wishlist</SideLink>
          <SideLink href="/student/settings">Profile Settings</SideLink>
        </nav>
      </aside>

      <div className="p-8 bg-cream">
        <div className="mb-7">
          <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium">Wishlist</span>
          <h1 className="font-display text-2xl mt-1">Courses you&apos;re considering</h1>
        </div>

        <div className="bg-ivory border border-gold/30 p-6">
          {items.length === 0 ? (
            <p className="text-sm text-ink/55">
              Nothing saved yet.{" "}
              <Link href="/courses" className="underline">
                Browse the catalog
              </Link>{" "}
              and save a course for later.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-widest text-ink/55 border-b border-gold/30">
                  <th className="py-2">Course</th>
                  <th className="py-2">Instructor</th>
                  <th className="py-2">Price</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-dotted border-gold/30 last:border-none">
                    <td className="py-3 font-medium">
                      <Link href={`/courses/${item.slug}`}>{item.title}</Link>
                    </td>
                    <td className="py-3">{item.instructor_name}</td>
                    <td className="py-3">${(item.price_cents / 100).toFixed(0)}</td>
                    <td className="py-3 text-right">
                      <form action={toggleWishlistAction}>
                        <input type="hidden" name="courseId" value={item.course_id} />
                        <input type="hidden" name="returnTo" value="/student/wishlist" />
                        <button type="submit" className="text-xs uppercase tracking-widest border border-gold px-3 py-2">
                          Remove
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
