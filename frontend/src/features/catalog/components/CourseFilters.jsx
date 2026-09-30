import { useSearchParams } from "react-router";
import { useInstructors } from "@/features/instructors/hooks";
import { formValues } from "@/lib/forms";
import { LEVELS } from "@/lib/labels";
import { useCourseStyles } from "../hooks";
import { FILTER_FIELDS, SORTS } from "../filters";

const CONTROL = "border border-gold/40 bg-ivory px-3 py-2";

/**
 * Filters live in the URL, so a filtered catalog is bookmarkable and
 * shareable. The form is uncontrolled and re-keyed on URL changes.
 */
export function CourseFilters() {
  const [params, setParams] = useSearchParams();
  const { data: styles = [] } = useCourseStyles();
  const { data: instructors = [] } = useInstructors();

  function handleSubmit(event) {
    event.preventDefault();
    const values = formValues(event.currentTarget);
    const next = new URLSearchParams();
    FILTER_FIELDS.forEach((field) => values[field] && next.set(field, values[field]));
    setParams(next);
  }

  return (
    <form
      key={params.toString()}
      onSubmit={handleSubmit}
      role="search"
      className="mb-10 flex flex-wrap gap-3 border border-gold/30 bg-ivory p-4 text-sm"
    >
      <input
        type="search"
        name="q"
        aria-label="Search courses"
        defaultValue={params.get("q") ?? ""}
        placeholder="Search courses…"
        className={`${CONTROL} min-w-[160px] flex-1`}
      />
      <select name="style" aria-label="Style" defaultValue={params.get("style") ?? ""} className={CONTROL}>
        <option value="">All Styles</option>
        {styles.map((style) => (
          <option key={style} value={style}>
            {style}
          </option>
        ))}
      </select>
      <select name="level" aria-label="Level" defaultValue={params.get("level") ?? ""} className={CONTROL}>
        <option value="">All Levels</option>
        {LEVELS.map((level) => (
          <option key={level.value} value={level.value}>
            {level.label}
          </option>
        ))}
      </select>
      <select name="instructor" aria-label="Instructor" defaultValue={params.get("instructor") ?? ""} className={CONTROL}>
        <option value="">All Instructors</option>
        {instructors.map((instructor) => (
          <option key={instructor.userId} value={instructor.userId}>
            {instructor.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        name="minPrice"
        min="0"
        aria-label="Minimum price in dollars"
        defaultValue={params.get("minPrice") ?? ""}
        placeholder="Min $"
        className={`${CONTROL} w-24`}
      />
      <input
        type="number"
        name="maxPrice"
        min="0"
        aria-label="Maximum price in dollars"
        defaultValue={params.get("maxPrice") ?? ""}
        placeholder="Max $"
        className={`${CONTROL} w-24`}
      />
      <select name="sort" aria-label="Sort by" defaultValue={params.get("sort") ?? ""} className={CONTROL}>
        {SORTS.map((sort) => (
          <option key={sort.value} value={sort.value}>
            {sort.label}
          </option>
        ))}
      </select>
      <button type="submit" className="bg-burgundy-deep px-5 py-2 text-xs tracking-widest text-gold-pale uppercase">
        Apply
      </button>
      <button
        type="button"
        onClick={() => setParams({})}
        className="self-center text-xs tracking-widest text-burgundy/60 uppercase underline"
      >
        Clear
      </button>
    </form>
  );
}
