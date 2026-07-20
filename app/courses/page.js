import CourseCard from "@/components/CourseCard";
import { listLiveCourses, listDistinctStyles, formatCourseForDisplay } from "@/lib/courses";
import { listInstructorsWithProfiles } from "@/lib/instructorProfiles";

export const metadata = { title: "Browse Courses — Belly Dance Academy" };

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default async function CoursesPage({ searchParams }) {
  const search = await searchParams;

  const filters = {
    style: search?.style || undefined,
    level: search?.level || undefined,
    instructorId: search?.instructor ? Number(search.instructor) : undefined,
    minPrice: search?.minPrice ? Number(search.minPrice) : undefined,
    maxPrice: search?.maxPrice ? Number(search.maxPrice) : undefined,
    q: search?.q || undefined,
    sort: search?.sort || undefined,
  };

  const courses = listLiveCourses(filters).map(formatCourseForDisplay);
  const styles = listDistinctStyles();
  const instructors = listInstructorsWithProfiles();

  return (
    <main className="flex-1">
      <section className="bg-burgundy-deep text-ivory">
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-12">
          <span className="text-xs tracking-[0.24em] uppercase text-gold font-medium">Catalog</span>
          <h1 className="font-display text-3xl md:text-4xl mt-3">Browse Courses</h1>
          <p className="text-gold-pale/80 mt-3 max-w-md">
            Courses across Baladi, Saidi, veil work, drum solo and folkloric styles.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-6">
          {/* Plain GET form — filters live in the URL, so results stay
              bookmarkable and crawlable rather than client-only state. */}
          <form
            method="get"
            className="flex flex-wrap gap-3 mb-10 bg-ivory border border-gold/30 p-4 text-sm"
          >
            <input
              type="text"
              name="q"
              defaultValue={search?.q ?? ""}
              placeholder="Search courses…"
              className="border border-gold/40 bg-ivory px-3 py-2 flex-1 min-w-[160px]"
            />
            <select name="style" defaultValue={search?.style ?? ""} className="border border-gold/40 bg-ivory px-3 py-2">
              <option value="">All Styles</option>
              {styles.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
            <select name="level" defaultValue={search?.level ?? ""} className="border border-gold/40 bg-ivory px-3 py-2">
              <option value="">All Levels</option>
              {LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <select
              name="instructor"
              defaultValue={search?.instructor ?? ""}
              className="border border-gold/40 bg-ivory px-3 py-2"
            >
              <option value="">All Instructors</option>
              {instructors.map((instructor) => (
                <option key={instructor.slug} value={instructor.user_id}>{instructor.name}</option>
              ))}
            </select>
            <input
              type="number"
              name="minPrice"
              defaultValue={search?.minPrice ?? ""}
              placeholder="Min $"
              className="border border-gold/40 bg-ivory px-3 py-2 w-24"
            />
            <input
              type="number"
              name="maxPrice"
              defaultValue={search?.maxPrice ?? ""}
              placeholder="Max $"
              className="border border-gold/40 bg-ivory px-3 py-2 w-24"
            />
            <select name="sort" defaultValue={search?.sort ?? ""} className="border border-gold/40 bg-ivory px-3 py-2">
              <option value="">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <button
              type="submit"
              className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-5 py-2"
            >
              Apply
            </button>
            <a href="/courses" className="text-xs uppercase tracking-widest text-burgundy/60 self-center underline">
              Clear
            </a>
          </form>

          {courses.length === 0 ? (
            <p className="text-sm text-ink/55">No courses match those filters.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
