import { Alert, AsyncContent, ErrorAlert, SelectField, TextAreaField } from "@/components/ui";
import { formValues } from "@/lib/forms";
import { useCourseReviews, useSubmitReview } from "../hooks";

const RATING_OPTIONS = [5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} star${n === 1 ? "" : "s"}` }));

/** @param viewer the course's viewer state; null unless a student is signed in */
export function CourseReviews({ slug, viewer }) {
  const reviews = useCourseReviews(slug);

  return (
    <div className="space-y-6">
      <AsyncContent query={reviews}>
        {(list) =>
          list.length === 0 ? (
            <p className="text-sm text-gold-pale/60">No reviews yet.</p>
          ) : (
            <ul className="space-y-3">
              {list.map((review) => (
                <li key={review.id} className="border-b border-dotted border-gold/30 pb-3">
                  <p className="text-gold-pale/80">
                    <strong className="text-gold-light" aria-label={`${review.rating} out of 5`}>
                      {"★".repeat(review.rating)}
                    </strong>
                    {review.comment && ` “${review.comment}”`}
                  </p>
                  <span className="text-xs text-gold-pale/50">— {review.studentName}</span>
                </li>
              ))}
            </ul>
          )
        }
      </AsyncContent>

      {viewer?.enrolled && <ReviewForm slug={slug} existing={viewer.review} />}
      {viewer && !viewer.enrolled && (
        <p className="text-xs text-gold-pale/50">Only students who&apos;ve purchased this course can leave a review.</p>
      )}
    </div>
  );
}

function ReviewForm({ slug, existing }) {
  const submit = useSubmitReview(slug);

  function handleSubmit(event) {
    event.preventDefault();
    const { rating, comment } = formValues(event.currentTarget);
    submit.mutate({ rating: Number(rating), comment });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-3 bg-ivory p-4 text-ink">
      <h3 className="font-display text-base">{existing ? "Update Your Review" : "Write a Review"}</h3>
      {submit.isSuccess && <Alert tone="success">Thanks — your review has been saved.</Alert>}
      <ErrorAlert error={submit.error} />
      <SelectField label="Rating" name="rating" defaultValue={existing?.rating ?? 5} options={RATING_OPTIONS} />
      <TextAreaField label="Comment (optional)" name="comment" rows={3} defaultValue={existing?.comment ?? ""} maxLength={2000} />
      <button
        type="submit"
        disabled={submit.isPending}
        className="self-start bg-gold px-4 py-2 text-xs font-medium tracking-widest text-burgundy-deep uppercase"
      >
        {existing ? "Update Review" : "Submit Review"}
      </button>
    </form>
  );
}
