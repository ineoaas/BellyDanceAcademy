import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";
import { listLiveCourses, formatCourseForDisplay } from "@/lib/courses";
import { listInstructorsWithProfiles } from "@/lib/instructorProfiles";
import { countEnrolledStudents } from "@/lib/purchases";
import { getFeaturedReview } from "@/lib/reviews";

const GALLERY = [
  { src: "/team-red-gold-costume-closeup.jpg", alt: "Detail of the Bellydance Company performance costume" },
  { src: "/team-red-gold-lineup-profile.jpg", alt: "Dancers in profile, lined up in matching costumes" },
  { src: "/team-veil-dance-arms-raised.jpg", alt: "Dancers raising silk veils overhead in the studio" },
  { src: "/team-veil-dance-twirl.jpg", alt: "A dancer twirling with a silk veil" },
];

export default function HomePage() {
  const courses = listLiveCourses().map(formatCourseForDisplay);
  const featured = courses[0];
  const minis = courses.slice(1, 3);
  const instructors = listInstructorsWithProfiles();
  const studentCount = countEnrolledStudents();
  const featuredReview = getFeaturedReview();

  return (
    <main className="flex-1">
      {/* HERO */}
      <section className="bg-burgundy-deep text-ivory">
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-14 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs tracking-[0.24em] uppercase text-gold font-medium">
              Online Academy · Oriental Dance
            </span>
            <h1 className="font-display text-4xl md:text-5xl mt-4 leading-tight">
              The art of <span className="font-script text-gold-light text-5xl md:text-6xl">Raqs Sharqi</span>,
              taught with devotion.
            </h1>
            <p className="mt-5 mb-7 text-gold-pale/80 max-w-md">
              Study technique, choreography and stage presence with instructors who&apos;ve
              performed the stages you&apos;re training for. Preview any lesson before you buy —
              own it for good.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button href="/courses" variant="primary">Browse Courses</Button>
              <Button href="/become-an-instructor" variant="outlineLight">Teach With Us</Button>
            </div>
            <div className="flex gap-8 mt-9 pt-5 border-t border-gold/30">
              <Stat value={courses.length} label="Courses" />
              <Stat value={instructors.length} label="Instructors" />
              <Stat value={studentCount} label="Students" />
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative aspect-square w-72 md:w-80 overflow-hidden border-2 border-gold shadow-xl">
              <Image
                src="/team-red-gold-lineup-wide.jpg"
                alt="The Bellydance Company dancers in matching red and gold"
                fill
                sizes="320px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED — asymmetric spotlight, not a uniform grid */}
      {featured && (
        <section className="py-14">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-10">
              <span className="text-xs tracking-[0.24em] uppercase text-burgundy font-medium">Featured</span>
              <h2 className="font-display text-2xl md:text-3xl mt-2">Where most dancers begin their week</h2>
            </div>

            <div className="grid md:grid-cols-[1.3fr_1fr] gap-6">
              <Link
                href={`/courses/${featured.slug}`}
                className="bg-ivory border border-gold/40 grid sm:grid-cols-2 relative"
              >
                <div className="bg-burgundy-deep flex items-center justify-center min-h-[220px]">
                  <span className="font-display text-7xl text-gold/40">{featured.letter}</span>
                </div>
                <div className="p-8 flex flex-col">
                  <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium mb-2">
                    {featured.level}
                    {featured.style ? ` · ${featured.style}` : ""}
                  </span>
                  <h3 className="font-display text-xl mb-2">{featured.title}</h3>
                  <p className="text-sm text-ink/60 mb-6">{featured.desc}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="font-display text-2xl text-burgundy">${featured.price}</span>
                    <span className="text-xs uppercase tracking-widest border border-gold px-4 py-2">
                      View Course
                    </span>
                  </div>
                </div>
              </Link>

              <div className="flex flex-col gap-5">
                {minis.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/courses/${c.slug}`}
                    className="bg-ivory border border-gold/35 p-5 flex gap-4 items-center flex-1"
                  >
                    <div className="medallion w-14 h-14 bg-cream border border-gold/50 font-display text-xl text-burgundy shrink-0">
                      {c.letter}
                    </div>
                    <div>
                      <h4 className="font-display text-base">{c.title}</h4>
                      <span className="text-sm text-burgundy font-medium">
                        ${c.price} · {c.instructor}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="bg-burgundy-deep text-ivory py-14">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs tracking-[0.24em] uppercase text-gold font-medium">How It Works</span>
            <h2 className="font-display text-2xl md:text-3xl mt-2">
              From your first preview to your first performance
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <Step numeral="I" title="Choose a course" text="Preview a free lesson before you commit, every time." />
            <Step numeral="II" title="Pay once, own it" text="Card, Apple Pay or Google Pay. Lifetime access, no subscription." />
            <Step numeral="III" title="Learn at your count" text="Track your progress and pick up right where you stopped." />
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-14">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs tracking-[0.24em] uppercase text-burgundy font-medium">Our Community</span>
            <h2 className="font-display text-2xl md:text-3xl mt-2">
              Dancers of the Academy, on stage and in studio
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GALLERY.map((img) => (
              <div
                key={img.src}
                className="relative aspect-[3/4] border border-gold/40 overflow-hidden"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTRUCTORS */}
      {instructors.length > 0 && (
        <section className="py-14">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-10">
              <span className="text-xs tracking-[0.24em] uppercase text-burgundy font-medium">Meet the Academy</span>
              <h2 className="font-display text-2xl md:text-3xl mt-2">
                Instructors who&apos;ve performed on the stages you&apos;re training for
              </h2>
            </div>
            <div className="flex gap-8 overflow-x-auto pb-4">
              {instructors.map((instructor, idx) => (
                <Link
                  key={instructor.slug}
                  href={`/instructors/${instructor.slug}`}
                  className={`flex-none w-40 text-center ${idx % 2 === 1 ? "mt-6" : ""}`}
                >
                  <div className="medallion w-28 h-28 mx-auto mb-3 bg-cream border border-gold/50 font-display text-2xl text-burgundy">
                    {instructor.name[0]}
                  </div>
                  <strong className="block font-display text-base">{instructor.name}</strong>
                  <span className="text-sm text-ink/60">{instructor.city}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIAL — a real review, not a placeholder quote; the section
          just doesn't render until at least one exists. */}
      {featuredReview && (
        <section className="pb-14">
          <div className="max-w-xl mx-auto px-8 text-center">
            <span className="font-script text-6xl text-gold block leading-none mb-3">&ldquo;</span>
            <p className="font-display italic text-xl mb-3">{featuredReview.comment}</p>
            <cite className="text-xs uppercase tracking-widest text-ink/60 not-italic">
              — {featuredReview.student_name}
            </cite>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative bg-burgundy-deep text-ivory text-center py-16 overflow-hidden">
        <Image
          src="/team-red-gold-group-huddle.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-burgundy-deep/80" />
        <div className="relative max-w-lg mx-auto px-6">
          <span className="text-xs tracking-[0.24em] uppercase text-gold font-medium">Become an Instructor</span>
          <h2 className="font-display text-2xl md:text-3xl mt-2 mb-3">
            Turn your choreography into a course of its own
          </h2>
          <p className="text-gold-pale/80 mb-7">
            Upload your lessons, set your price. We handle checkout, access and payout automatically.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button href="/become-an-instructor" variant="primary">Start Teaching</Button>
            <Button href="/courses" variant="outlineLight">See Example Courses</Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <strong className="block font-display text-xl text-gold-light">{value}</strong>
      <span className="text-[0.65rem] uppercase tracking-widest text-gold-pale/60">{label}</span>
    </div>
  );
}

function Step({ numeral, title, text }) {
  return (
    <div className="text-center">
      <div className="medallion w-16 h-16 mx-auto mb-4 border border-gold font-display text-xl text-gold-light bg-burgundy-dark">
        {numeral}
      </div>
      <h3 className="font-display text-lg mb-1">{title}</h3>
      <p className="text-sm text-gold-pale/70 max-w-[24ch] mx-auto">{text}</p>
    </div>
  );
}
