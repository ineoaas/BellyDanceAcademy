import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listAllReviewsForAdmin } from "@/lib/reviews";
import { setReviewStatusAction } from "@/lib/actions/admin";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminReviewsPage() {
  const admin = await requireUser("admin");
  const reviews = listAllReviewsForAdmin();

  return (
    <main className="grid md:grid-cols-[220px_1fr] flex-1">
      <AdminSidebar admin={admin} active="reviews" />

      <div className="p-8 bg-cream">
        <div className="mb-7">
          <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium">Reviews</span>
          <h1 className="font-display text-2xl mt-1">Moderate Reviews</h1>
        </div>

        <div className="bg-ivory border border-gold/30 p-6">
          {reviews.length === 0 ? (
            <p className="text-sm text-ink/55">No reviews yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-widest text-ink/55 border-b border-gold/30">
                  <th className="py-2">Course</th>
                  <th className="py-2">Student</th>
                  <th className="py-2">Rating</th>
                  <th className="py-2">Comment</th>
                  <th className="py-2">Status</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id} className="border-b border-dotted border-gold/30 last:border-none align-top">
                    <td className="py-3 font-medium">
                      <Link href={`/courses/${review.course_slug}`}>{review.course_title}</Link>
                    </td>
                    <td className="py-3">{review.student_name}</td>
                    <td className="py-3">{"★".repeat(review.rating)}</td>
                    <td className="py-3 max-w-xs">{review.comment || "—"}</td>
                    <td className="py-3">
                      <span
                        className={
                          "inline-block px-2.5 py-1 text-[0.6rem] uppercase font-semibold " +
                          (review.status === "visible" ? "bg-emerald-800/10 text-emerald-800" : "bg-gold/20 text-[#7A5D1D]")
                        }
                      >
                        {review.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <form action={setReviewStatusAction}>
                        <input type="hidden" name="reviewId" value={review.id} />
                        <input type="hidden" name="status" value={review.status === "visible" ? "hidden" : "visible"} />
                        <button type="submit" className="text-xs uppercase tracking-widest border border-gold px-3 py-2">
                          {review.status === "visible" ? "Hide" : "Unhide"}
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

