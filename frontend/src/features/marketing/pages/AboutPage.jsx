import { Button, PageHero } from "@/components/ui";

const SECTIONS = [
  {
    title: "What we're building",
    body: "The Belly Dance Academy is a marketplace where independent instructors sell their own video courses directly to students. We handle checkout, video hosting, and payouts; instructors keep their own pricing, their own students, and their own teaching style.",
  },
  {
    title: "Why Oriental dance",
    body: "Raqs Sharqi and its regional styles — Baladi, Saidi, veil work, drum solo — carry decades of technique that rarely makes it past the studios where it's taught. We started here because it's where the gap between demand and access felt widest, with room to grow into the broader world of Oriental dance over time.",
  },
  {
    title: "How instructors are chosen",
    body: "Every instructor applies and is reviewed before their courses go live. We're looking for real performance and teaching experience, not just production value — the goal is technique worth learning, taught by someone who can actually explain it.",
  },
];

export default function AboutPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="About Us" title="An academy built by dancers, for dancers">
        We believe the best Oriental dance instruction in the world is scattered across studios most people
        will never get to visit. Our job is to bring it online — without losing what makes it worth learning
        in the first place.
      </PageHero>

      <section className="py-14">
        <div className="mx-auto max-w-3xl space-y-8 px-6 text-ink/75">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="mb-2 font-display text-xl text-burgundy">{section.title}</h2>
              <p>{section.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="mx-auto max-w-lg px-6 text-center">
          <h2 className="mb-3 font-display text-2xl">Teach with us</h2>
          <p className="mb-6 text-ink/70">Have choreography worth sharing? We&apos;d like to see it.</p>
          <Button to="/become-an-instructor">Become an Instructor</Button>
        </div>
      </section>
    </main>
  );
}
