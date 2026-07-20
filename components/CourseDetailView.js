"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import LessonPlayer from "@/components/LessonPlayer";
import { purchaseCourseAction } from "@/lib/actions/purchase";
import { submitReviewAction } from "@/lib/actions/reviews";
import { toggleWishlistAction } from "@/lib/actions/wishlist";

const TABS = ["curriculum", "about", "reviews"];

export default function CourseDetailView({
  course,
  alreadyPurchased,
  isLoggedInStudent,
  reviews,
  existingReview,
  wishlisted,
  purchaseError,
  checkoutCancelled,
  lockedError,
  reviewed,
}) {
  const [tab, setTab] = useState("curriculum");
  const [previewLesson, setPreviewLesson] = useState(null);

  return (
    <main className="flex-1 flex flex-col">
      <section className="bg-burgundy-deep text-ivory flex-1">
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-12">
          <div className="text-xs text-gold-pale/55 mb-4">
            <Link href="/courses" className="hover:text-gold-light">Browse Courses</Link> / {course.level} /{" "}
            <span className="text-gold-light">{course.title}</span>
          </div>

          <div className="grid md:grid-cols-[1.6fr_1fr] gap-9">
            <div>
              <span className="text-xs tracking-[0.2em] uppercase text-gold font-medium">
                {course.level}
                {course.style ? ` · ${course.style}` : ""}
              </span>
              <h1 className="font-display text-2xl md:text-3xl mt-3">{course.title}</h1>
              <p className="text-gold-pale/70 mt-2 text-sm">
                By{" "}
                {course.instructorSlug ? (
                  <Link href={`/instructors/${course.instructorSlug}`} className="text-gold-light hover:underline">
                    {course.instructor}
                  </Link>
                ) : (
                  course.instructor
                )}
              </p>
              <p className="text-gold-pale/80 mt-3 max-w-md">{course.desc}</p>

              <div className="flex gap-5 flex-wrap text-sm text-gold-pale/80 mt-4">
                <span>
                  {course.reviewCount > 0 ? (
                    <>
                      <strong className="text-gold-light">{course.rating}</strong> {course.ratingValue} ·{" "}
                      {course.reviewCount} reviews
                    </>
                  ) : (
                    "No reviews yet"
                  )}
                </span>
                <span><strong className="text-gold-light">{course.lessons}</strong> lessons</span>
                <span><strong className="text-gold-light">{course.duration}</strong> total</span>
              </div>

              <div className="flex gap-6 border-b border-gold/30 mt-7 mb-5">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`pb-2 text-xs uppercase tracking-widest border-b-2 ${
                      tab === t ? "text-gold-light border-gold-light" : "text-gold-pale/55 border-transparent"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {tab === "curriculum" && (
                <div>
                  {previewLesson && (
                    <div className="mb-5">
                      <LessonPlayer lesson={{ id: previewLesson.id, title: previewLesson.title, mux_playback_id: previewLesson.muxPlaybackId }} />
                      <button
                        onClick={() => setPreviewLesson(null)}
                        className="text-xs uppercase tracking-widest text-gold-pale/60 hover:text-gold-light mt-2"
                      >
                        Close preview
                      </button>
                    </div>
                  )}
                  {course.curriculum.map((lesson, i) => (
                    <div key={lesson.id ?? lesson.title} className="flex justify-between py-3 border-b border-dotted border-gold/30 text-sm">
                      <span>
                        <span className="font-display italic text-gold-light mr-2">
                          {i + 1}.
                        </span>
                        {lesson.title}
                      </span>
                      <span className="text-xs text-gold-pale/60">
                        {lesson.time}
                        {lesson.preview && lesson.muxPlaybackId && (
                          <button
                            onClick={() => setPreviewLesson(lesson)}
                            className="ml-2 text-gold-light hover:underline"
                          >
                            ▶ Preview
                          </button>
                        )}
                        {lesson.preview && !lesson.muxPlaybackId && " · Preview"}
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 text-sm text-gold-pale/50">
                    + {course.lessons - course.curriculum.length} more lessons
                  </div>
                </div>
              )}
              {tab === "about" && <p className="text-gold-pale/80">{course.about}</p>}
              {tab === "reviews" && (
                <div className="space-y-6">
                  {reviewed && (
                    <p className="text-xs text-emerald-400">Thanks — your review has been posted.</p>
                  )}

                  {reviews.length === 0 ? (
                    <p className="text-gold-pale/60 text-sm">No reviews yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-dotted border-gold/30 pb-3">
                          <p className="text-gold-pale/80">
                            <strong className="text-gold-light">{"★".repeat(review.rating)}</strong>
                            {review.comment && ` "${review.comment}"`}
                          </p>
                          <span className="text-xs text-gold-pale/50">— {review.student_name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {isLoggedInStudent && alreadyPurchased && (
                    <form action={submitReviewAction} className="max-w-sm">
                      <input type="hidden" name="courseId" value={course.id} />
                      <h4 className="font-display text-base mb-2">
                        {existingReview ? "Update Your Review" : "Write a Review"}
                      </h4>
                      <select
                        name="rating"
                        defaultValue={existingReview?.rating ?? 5}
                        className="border border-gold/40 bg-ivory text-ink px-3 py-2 text-sm mb-2 block"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} star{n === 1 ? "" : "s"}
                          </option>
                        ))}
                      </select>
                      <textarea
                        name="comment"
                        rows={3}
                        defaultValue={existingReview?.comment ?? ""}
                        placeholder="Optional comment"
                        className="border border-gold/40 bg-ivory text-ink px-3 py-2 text-sm block w-full mb-2"
                      />
                      <button
                        type="submit"
                        className="text-xs uppercase tracking-widest bg-gold text-burgundy-deep px-4 py-2 font-medium"
                      >
                        {existingReview ? "Update Review" : "Submit Review"}
                      </button>
                    </form>
                  )}
                  {isLoggedInStudent && !alreadyPurchased && (
                    <p className="text-xs text-gold-pale/50">
                      Only students who&apos;ve purchased this course can leave a review.
                    </p>
                  )}
                </div>
              )}
            </div>

            <aside>
              <div className="bg-ivory text-ink p-6 relative">
                <div className="aspect-[16/10] bg-burgundy-deep mb-5 flex items-center justify-center">
                  <span className="font-display text-5xl text-gold/50">{course.letter}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-5 font-display">
                  <strong className="text-3xl text-burgundy">${course.price}</strong>
                  {course.originalPrice && <s className="text-ink/50">${course.originalPrice}</s>}
                </div>

                {alreadyPurchased ? (
                  <Button href="/student" variant="primary" className="w-full">
                    Go to Your Course
                  </Button>
                ) : (
                  <form action={purchaseCourseAction}>
                    <input type="hidden" name="slug" value={course.slug} />
                    <Button type="submit" variant="primary" className="w-full">
                      Buy Now
                    </Button>
                  </form>
                )}

                {!alreadyPurchased && (
                  <form action={toggleWishlistAction} className="mt-2">
                    <input type="hidden" name="courseId" value={course.id} />
                    <button
                      type="submit"
                      className="text-xs uppercase tracking-widest border border-gold px-4 py-2.5 w-full"
                    >
                      {wishlisted ? "♥ Saved to Wishlist" : "♡ Save to Wishlist"}
                    </button>
                  </form>
                )}

                {purchaseError && (
                  <p className="text-xs text-burgundy mt-3">
                    This course isn&apos;t available for purchase yet — the instructor is still setting
                    up payouts.
                  </p>
                )}
                {checkoutCancelled && (
                  <p className="text-xs text-ink/50 mt-3">Checkout cancelled — no charge was made.</p>
                )}
                {lockedError && (
                  <p className="text-xs text-burgundy mt-3">
                    That lesson is only available to students enrolled in this course.
                  </p>
                )}

                <ul className="mt-5 space-y-2 text-sm text-ink/65">
                  <li>— Lifetime access, watch anytime</li>
                  <li>— {course.lessons} HD video lessons</li>
                  <li>— Downloadable practice notes</li>
                  <li>— Access on web, iOS &amp; Android</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
