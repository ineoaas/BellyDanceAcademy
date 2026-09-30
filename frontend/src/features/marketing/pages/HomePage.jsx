import { Link } from "react-router";
import { Button, Medallion, SectionHeading } from "@/components/ui";
import { useCourseSearch } from "@/features/catalog/hooks";
import { useInstructors } from "@/features/instructors/hooks";
import { formatPrice, initial } from "@/lib/format";
import { levelLabel } from "@/lib/labels";
import { useFeaturedReview, usePublicStats } from "../hooks";

const GALLERY = [
  { src: "/team-red-gold-costume-closeup.jpg", alt: "Detail of the Bellydance Company performance costume" },
  { src: "/team-red-gold-lineup-profile.jpg", alt: "Dancers in profile, lined up in matching costumes" },
  { src: "/team-veil-dance-arms-raised.jpg", alt: "Dancers raising silk veils overhead in the studio" },
  { src: "/team-veil-dance-twirl.jpg", alt: "A dancer twirling with a silk veil" },
];

const STEPS = [
  { numeral: "I", title: "Choose a course", text: "Preview a free lesson before you commit, every time." },
  {
    numeral: "II",
    title: "Pay once, own it",
    text: "Card, Apple Pay or Google Pay. Lifetime access, no subscription.",
  },
  {
    numeral: "III",
    title: "Learn at your count",
    text: "Track your progress and pick up right where you stopped.",
  },
];

export default function HomePage() {
  const { data: courses = [] } = useCourseSearch();
  const { data: instructors = [] } = useInstructors();
  const { data: stats } = usePublicStats();
  const { data: featuredReview } = useFeaturedReview();

  const [featured, ...others] = courses;

  return (
    <main className="flex-1">
      <section className="bg-burgundy-deep text-ivory">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-14 md:grid-cols-2">
          <div>
            <span className="eyebrow text-gold">Online Academy · Oriental Dance</span>
            <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              The art of <span className="font-script text-5xl text-gold-light md:text-6xl">Raqs Sharqi</span>
              , taught with devotion.
            </h1>
            <p className="mt-5 mb-7 max-w-md text-gold-pale/80">
              Study technique, choreography and stage presence with instructors who&apos;ve performed the
              stages you&apos;re training for. Preview any lesson before you buy — own it for good.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button to="/courses">Browse Courses</Button>
              <Button to="/become-an-instructor" variant="outlineLight">
                Teach With Us
              </Button>
            </div>
            {stats && (
              <dl className="mt-9 flex gap-8 border-t border-gold/30 pt-5">
                <Stat value={stats.courseCount} label="Courses" />
                <Stat value={stats.instructorCount} label="Instructors" />
                <Stat value={stats.studentCount} label="Students" />
              </dl>
            )}
          </div>
          <div className="flex justify-center">
            <img
              src="/team-red-gold-lineup-wide.jpg"
              alt="The Bellydance Company dancers in matching red and gold"
              className="aspect-square w-72 border-2 border-gold object-cover shadow-xl md:w-80"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      {featured && (
        <section className="py-14">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHeading eyebrow="Featured" title="Where most dancers begin their week" />
            <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
              <Link
                to={`/courses/${featured.slug}`}
                className="grid border border-gold/40 bg-ivory sm:grid-cols-2"
              >
                <div className="flex min-h-[220px] items-center justify-center bg-burgundy-deep">
                  <span aria-hidden="true" className="font-display text-7xl text-gold/40">
                    {initial(featured.title)}
                  </span>
                </div>
                <div className="flex flex-col p-8">
                  <span className="mb-2 text-xs font-medium tracking-[0.2em] text-burgundy uppercase">
                    {levelLabel(featured.level)}
                    {featured.style && ` · ${featured.style}`}
                  </span>
                  <h3 className="mb-2 font-display text-xl">{featured.title}</h3>
                  <p className="mb-6 text-sm text-ink/60">{featured.description}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-display text-2xl text-burgundy">
                      {formatPrice(featured.priceCents)}
                    </span>
                    <span className="border border-gold px-4 py-2 text-xs tracking-widest uppercase">
                      View Course
                    </span>
                  </div>
                </div>
              </Link>
              <div className="flex flex-col gap-5">
                {others.slice(0, 2).map((course) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.slug}`}
                    className="flex flex-1 items-center gap-4 border border-gold/35 bg-ivory p-5"
                  >
                    <Medallion text={course.title} />
                    <div>
                      <h4 className="font-display text-base">{course.title}</h4>
                      <span className="text-sm font-medium text-burgundy">
                        {formatPrice(course.priceCents)} · {course.instructorName}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-burgundy-deep py-14 text-ivory">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeading
            eyebrow="How It Works"
            title="From your first preview to your first performance"
            light
          />
          <ol className="grid gap-10 md:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.numeral} className="text-center">
                <div className="medallion mx-auto mb-4 h-16 w-16 border border-gold bg-burgundy-dark font-display text-xl text-gold-light">
                  {step.numeral}
                </div>
                <h3 className="mb-1 font-display text-lg">{step.title}</h3>
                <p className="mx-auto max-w-[24ch] text-sm text-gold-pale/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeading eyebrow="Our Community" title="Dancers of the Academy, on stage and in studio" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {GALLERY.map((image) => (
              <img
                key={image.src}
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="aspect-[3/4] w-full border border-gold/40 object-cover"
              />
            ))}
          </div>
        </div>
      </section>

      {instructors.length > 0 && (
        <section className="py-14">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHeading
              eyebrow="Meet the Academy"
              title="Instructors who've performed on the stages you're training for"
            />
            <div className="flex gap-8 overflow-x-auto pb-4">
              {instructors.map((instructor, index) => (
                <Link
                  key={instructor.slug}
                  to={`/instructors/${instructor.slug}`}
                  className={`w-40 flex-none text-center ${index % 2 === 1 ? "mt-6" : ""}`}
                >
                  <Medallion
                    text={instructor.name}
                    size="xl"
                    className="mx-auto mb-3 border border-gold/50 bg-cream text-burgundy"
                  />
                  <strong className="block font-display text-base">{instructor.name}</strong>
                  <span className="text-sm text-ink/60">{instructor.city}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {featuredReview && (
        <section className="pb-14">
          <figure className="mx-auto max-w-xl px-8 text-center">
            <span aria-hidden="true" className="mb-3 block font-script text-6xl leading-none text-gold">
              &ldquo;
            </span>
            <blockquote className="mb-3 font-display text-xl italic">{featuredReview.comment}</blockquote>
            <figcaption className="text-xs tracking-widest text-ink/60 uppercase">
              — {featuredReview.studentName}
            </figcaption>
          </figure>
        </section>
      )}

      <section className="relative overflow-hidden bg-burgundy-deep py-16 text-center text-ivory">
        <img
          src="/team-red-gold-group-huddle.jpg"
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-burgundy-deep/80" />
        <div className="relative mx-auto max-w-lg px-6">
          <span className="eyebrow text-gold">Become an Instructor</span>
          <h2 className="mt-2 mb-3 font-display text-2xl md:text-3xl">
            Turn your choreography into a course of its own
          </h2>
          <p className="mb-7 text-gold-pale/80">
            Upload your lessons, set your price. We handle checkout, access and payout automatically.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button to="/become-an-instructor">Start Teaching</Button>
            <Button to="/courses" variant="outlineLight">
              See Example Courses
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <dd className="font-display text-xl text-gold-light">{value}</dd>
      <dt className="text-[0.65rem] tracking-widest text-gold-pale/60 uppercase">{label}</dt>
    </div>
  );
}
