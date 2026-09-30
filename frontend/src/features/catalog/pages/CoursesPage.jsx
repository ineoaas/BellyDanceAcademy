import { useSearchParams } from "react-router";
import { AsyncContent, PageHero } from "@/components/ui";
import { CourseFilters } from "../components/CourseFilters";
import { CourseGrid } from "../components/CourseCard";
import { toApiFilters } from "../filters";
import { useCourseSearch } from "../hooks";

export default function CoursesPage() {
  const [params] = useSearchParams();
  const courses = useCourseSearch(toApiFilters(params));

  return (
    <main className="flex-1">
      <PageHero eyebrow="Catalog" title="Browse Courses">
        Courses across Baladi, Saidi, veil work, drum solo and folkloric styles.
      </PageHero>
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-6">
          <CourseFilters />
          <AsyncContent query={courses}>
            {(results) => <CourseGrid courses={results} empty="No courses match those filters." />}
          </AsyncContent>
        </div>
      </section>
    </main>
  );
}
