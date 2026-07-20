import Link from "next/link";
import { listInstructorsWithProfiles } from "@/lib/instructorProfiles";

export const metadata = { title: "Instructors — Belly Dance Academy" };

export default function InstructorsPage() {
  const instructors = listInstructorsWithProfiles();

  return (
    <main className="flex-1">
      <section className="bg-burgundy-deep text-ivory">
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-14">
          <span className="text-xs tracking-[0.24em] uppercase text-gold font-medium">Instructors</span>
          <h1 className="font-display text-3xl md:text-4xl mt-3">Meet the Academy</h1>
          <p className="text-gold-pale/80 mt-4 max-w-md">
            Instructors who&apos;ve performed the stages they&apos;re now teaching for.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-5xl mx-auto px-6">
          {instructors.length === 0 ? (
            <p className="text-sm text-ink/55">No instructor profiles yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {instructors.map((instructor) => (
                <Link
                  key={instructor.slug}
                  href={`/instructors/${instructor.slug}`}
                  className="bg-ivory border border-gold/35 p-6 text-center transition-all hover:-translate-y-1 hover:border-gold"
                >
                  <div className="medallion w-20 h-20 mx-auto mb-4 bg-cream border border-gold/50 font-display text-2xl text-burgundy">
                    {instructor.name[0]}
                  </div>
                  <strong className="block font-display text-lg">{instructor.name}</strong>
                  <span className="text-sm text-ink/60 block mb-2">{instructor.city}</span>
                  <span className="text-xs uppercase tracking-widest text-gold">
                    {instructor.course_count} {instructor.course_count === 1 ? "course" : "courses"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
