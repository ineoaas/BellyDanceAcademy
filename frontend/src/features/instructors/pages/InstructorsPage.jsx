import { Link } from "react-router";
import { AsyncContent, Medallion, PageHero } from "@/components/ui";
import { pluralize } from "@/lib/format";
import { useInstructors } from "../hooks";

export default function InstructorsPage() {
  const instructors = useInstructors();

  return (
    <main className="flex-1">
      <PageHero eyebrow="Instructors" title="Meet the Academy">
        Instructors who&apos;ve performed the stages they&apos;re now teaching for.
      </PageHero>
      <section className="py-14">
        <div className="mx-auto max-w-5xl px-6">
          <AsyncContent query={instructors}>
            {(list) =>
              list.length === 0 ? (
                <p className="text-sm text-ink/55">No instructor profiles yet.</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {list.map((instructor) => (
                    <Link
                      key={instructor.slug}
                      to={`/instructors/${instructor.slug}`}
                      className="border border-gold/35 bg-ivory p-6 text-center transition-all hover:-translate-y-1 hover:border-gold"
                    >
                      <Medallion text={instructor.name} size="lg" className="mx-auto mb-4 border border-gold/50 bg-cream text-burgundy" />
                      <strong className="block font-display text-lg">{instructor.name}</strong>
                      <span className="mb-2 block text-sm text-ink/60">{instructor.city}</span>
                      <span className="text-xs tracking-widest text-gold uppercase">
                        {pluralize(instructor.courseCount, "course")}
                      </span>
                    </Link>
                  ))}
                </div>
              )
            }
          </AsyncContent>
        </div>
      </section>
    </main>
  );
}
