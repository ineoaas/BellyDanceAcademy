import { useLocation, useNavigate } from "react-router";
import { Alert, Button, ErrorAlert } from "@/components/ui";
import { useSession } from "@/features/auth/hooks";
import { useSetWishlisted } from "@/features/student/hooks";
import { formatPrice, initial, pluralize } from "@/lib/format";
import { useStartCheckout } from "../hooks";

export function PurchasePanel({ course, viewer, notice }) {
  const { data: user } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const checkout = useStartCheckout(course.slug);
  const setWishlisted = useSetWishlisted();

  const isStudent = user?.role === "STUDENT";
  const enrolled = viewer?.enrolled;

  /** Guests are sent to sign in first, then brought back here. */
  function asStudent(action) {
    if (!user) {
      const params = new URLSearchParams({ as: "student", redirect: location.pathname });
      navigate(`/login?${params}`);
      return;
    }
    action();
  }

  return (
    <div className="bg-ivory p-6 text-ink">
      <div className="mb-5 flex aspect-[16/10] items-center justify-center bg-burgundy-deep">
        <span aria-hidden="true" className="font-display text-5xl text-gold/50">
          {initial(course.title)}
        </span>
      </div>
      <div className="mb-5 flex items-baseline gap-2 font-display">
        <strong className="text-3xl text-burgundy">{formatPrice(course.priceCents)}</strong>
        {course.originalPriceCents && <s className="text-ink/50">{formatPrice(course.originalPriceCents)}</s>}
      </div>

      {enrolled ? (
        <Button to="/student" className="w-full">
          Go to Your Course
        </Button>
      ) : (
        <>
          <Button
            className="w-full"
            disabled={checkout.isPending || (user && !isStudent)}
            onClick={() => asStudent(() => checkout.mutate())}
          >
            {checkout.isPending ? "Redirecting…" : "Buy Now"}
          </Button>
          {(!user || isStudent) && (
            <button
              type="button"
              disabled={setWishlisted.isPending}
              onClick={() =>
                asStudent(() => setWishlisted.mutate({ courseId: course.id, wishlisted: !viewer?.wishlisted }))
              }
              className="mt-2 w-full border border-gold px-4 py-2.5 text-xs tracking-widest uppercase"
            >
              {viewer?.wishlisted ? "♥ Saved to Wishlist" : "♡ Save to Wishlist"}
            </button>
          )}
          {user && !isStudent && (
            <p className="mt-3 text-xs text-ink/50">Sign in with a student account to buy courses.</p>
          )}
        </>
      )}

      <ErrorAlert error={checkout.error} className="mt-3 text-xs" />
      <Alert tone="info" className="mt-3 text-xs">
        {notice}
      </Alert>

      <ul className="mt-5 space-y-2 text-sm text-ink/65">
        <li>— Lifetime access, watch anytime</li>
        <li>— {pluralize(course.lessonCount, "HD video lesson")}</li>
        <li>— Resume right where you stopped</li>
        <li>— Watch on any device</li>
      </ul>
    </div>
  );
}
