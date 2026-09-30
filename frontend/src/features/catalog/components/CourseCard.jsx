import { Link } from "react-router";
import { formatPrice, initial, pluralize, stars } from "@/lib/format";
import { levelLabel } from "@/lib/labels";

export function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="flex flex-col border border-gold/35 bg-ivory transition-all hover:-translate-y-1 hover:border-gold hover:shadow-lg hover:shadow-burgundy/10"
    >
      <div className="relative flex aspect-[16/10] items-center justify-center bg-burgundy-deep">
        <span aria-hidden="true" className="font-display text-6xl text-gold/40">
          {initial(course.title)}
        </span>
        <span className="absolute top-3 right-3 bg-gold px-3 py-1 text-xs font-semibold text-burgundy-deep">
          {formatPrice(course.priceCents)}
        </span>
        <span className="absolute bottom-3 left-3 border border-gold px-2 py-1 text-[0.6rem] tracking-widest text-gold-light uppercase">
          {levelLabel(course.level)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 font-display text-sm text-ink/60 italic">{course.instructorName}</div>
        <h3 className="mb-1 font-display text-lg">{course.title}</h3>
        <p className="flex-1 text-sm text-ink/60">{course.description}</p>
        <div className="mt-4 flex justify-between gap-2 border-t border-dotted border-gold/50 pt-3 text-xs text-ink/60">
          <span className="tracking-wide text-gold">
            {course.reviewCount > 0 ? (
              <span aria-label={`Rated ${course.averageRating} out of 5`}>{stars(course.averageRating)}</span>
            ) : (
              "No reviews yet"
            )}
          </span>
          <span>{pluralize(course.lessonCount, "lesson")}</span>
          {course.durationLabel && <span>{course.durationLabel}</span>}
        </div>
      </div>
    </Link>
  );
}

export function CourseGrid({ courses, empty = "No courses yet." }) {
  if (courses.length === 0) return <p className="text-sm text-ink/55">{empty}</p>;
  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
