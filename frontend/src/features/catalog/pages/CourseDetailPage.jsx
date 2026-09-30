import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { ErrorState, LoadingState } from "@/components/ui";
import NotFoundPage from "@/features/marketing/pages/NotFoundPage";
import { pluralize, stars } from "@/lib/format";
import { levelLabel } from "@/lib/labels";
import { CourseReviews } from "../components/CourseReviews";
import { Curriculum } from "../components/Curriculum";
import { PurchasePanel } from "../components/PurchasePanel";
import { useCourse } from "../hooks";

const TABS = ["curriculum", "about", "reviews"];

const NOTICES = {
  cancelled: "Checkout cancelled — no charge was made.",
  locked: "That lesson is only available to students enrolled in this course.",
};

export default function CourseDetailPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const [tab, setTab] = useState("curriculum");
  const detail = useCourse(slug);

  if (detail.isPending) return <LoadingState />;
  if (detail.isError) {
    return detail.error.status === 404 ? (
      <NotFoundPage />
    ) : (
      <ErrorState error={detail.error} onRetry={detail.refetch} />
    );
  }

  const { course, about, instructorSlug, curriculum, viewer } = detail.data;
  const notice =
    params.get("checkout") === "cancelled" ? NOTICES.cancelled : params.has("locked") ? NOTICES.locked : null;

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex-1 bg-burgundy-deep text-ivory">
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-12">
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-gold-pale/55">
            <Link to="/courses" className="hover:text-gold-light">
              Browse Courses
            </Link>{" "}
            / {levelLabel(course.level)} / <span className="text-gold-light">{course.title}</span>
          </nav>

          <div className="grid gap-9 md:grid-cols-[1.6fr_1fr]">
            <div>
              <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
                {levelLabel(course.level)}
                {course.style && ` · ${course.style}`}
              </span>
              <h1 className="mt-3 font-display text-2xl md:text-3xl">{course.title}</h1>
              <p className="mt-2 text-sm text-gold-pale/70">
                By{" "}
                {instructorSlug ? (
                  <Link to={`/instructors/${instructorSlug}`} className="text-gold-light hover:underline">
                    {course.instructorName}
                  </Link>
                ) : (
                  course.instructorName
                )}
              </p>
              <p className="mt-3 max-w-md text-gold-pale/80">{course.description}</p>

              <div className="mt-4 flex flex-wrap gap-5 text-sm text-gold-pale/80">
                <span>
                  {course.reviewCount > 0 ? (
                    <>
                      <strong className="text-gold-light">{stars(course.averageRating)}</strong>{" "}
                      {course.averageRating} · {pluralize(course.reviewCount, "review")}
                    </>
                  ) : (
                    "No reviews yet"
                  )}
                </span>
                <span>
                  <strong className="text-gold-light">{course.lessonCount}</strong> lessons
                </span>
                {course.durationLabel && (
                  <span>
                    <strong className="text-gold-light">{course.durationLabel}</strong> total
                  </span>
                )}
              </div>

              <div role="tablist" className="mt-7 mb-5 flex gap-6 border-b border-gold/30">
                {TABS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    role="tab"
                    aria-selected={tab === name}
                    onClick={() => setTab(name)}
                    className={`border-b-2 pb-2 text-xs tracking-widest uppercase ${
                      tab === name
                        ? "border-gold-light text-gold-light"
                        : "border-transparent text-gold-pale/55"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div role="tabpanel">
                {tab === "curriculum" && <Curriculum lessons={curriculum} />}
                {tab === "about" && <p className="whitespace-pre-line text-gold-pale/80">{about}</p>}
                {tab === "reviews" && <CourseReviews slug={course.slug} viewer={viewer} />}
              </div>
            </div>

            <aside>
              <PurchasePanel course={course} viewer={viewer} notice={notice} />
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
