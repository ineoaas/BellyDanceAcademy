import CourseCard from "@/components/CourseCard";
import { COURSES } from "@/lib/mockData";

export const metadata = { title: "Browse Courses — Belly Dance Academy" };

export default function CoursesPage() {
  return (
    <main className="flex-1">
      <section className="bg-burgundy-deep text-ivory">
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-12">
          <span className="text-xs tracking-[0.24em] uppercase text-gold font-medium">Catalog</span>
          <h1 className="font-display text-3xl md:text-4xl mt-3">Browse Courses</h1>
          <p className="text-gold-pale/80 mt-3 max-w-md">
            120+ courses across Baladi, Saidi, veil work, drum solo and folkloric styles.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {COURSES.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
