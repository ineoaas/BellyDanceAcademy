import Button from "@/components/Button";

export const metadata = { title: "About Us — Belly Dance Academy" };

export default function AboutPage() {
  return (
    <main className="flex-1">
      <section className="bg-burgundy-deep text-ivory">
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-14">
          <span className="text-xs tracking-[0.24em] uppercase text-gold font-medium">About Us</span>
          <h1 className="font-display text-3xl md:text-4xl mt-3 max-w-lg">
            An academy built by dancers, for dancers
          </h1>
          <p className="text-gold-pale/80 mt-4 max-w-md">
            We believe the best Oriental dance instruction in the world is scattered across
            studios most people will never get to visit. Our job is to bring it online — without
            losing what makes it worth learning in the first place.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-3xl mx-auto px-6 space-y-8 text-ink/75">
          <div>
            <h2 className="font-display text-xl text-burgundy mb-2">What we&apos;re building</h2>
            <p>
              The Belly Dance Academy is a marketplace where independent instructors sell their
              own video courses directly to students. We handle checkout, video hosting, and
              payouts; instructors keep their own pricing, their own students, and their own
              teaching style.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl text-burgundy mb-2">Why Oriental dance</h2>
            <p>
              Raqs Sharqi and its regional styles — Baladi, Saidi, veil work, drum solo — carry
              decades of technique that rarely makes it past the studios where it&apos;s taught.
              We started here because it&apos;s where the gap between demand and access felt
              widest, with room to grow into the broader world of Oriental dance over time.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl text-burgundy mb-2">How instructors are chosen</h2>
            <p>
              Every instructor applies and is reviewed before their courses go live. We&apos;re
              looking for real performance and teaching experience, not just production value —
              the goal is technique worth learning, taught by someone who can actually explain it.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="max-w-lg mx-auto px-6 text-center">
          <h2 className="font-display text-2xl mb-3">Teach with us</h2>
          <p className="text-ink/70 mb-6">
            Have choreography worth sharing? We&apos;d like to see it.
          </p>
          <Button href="/become-an-instructor" variant="primary">Become an Instructor</Button>
        </div>
      </section>
    </main>
  );
}
