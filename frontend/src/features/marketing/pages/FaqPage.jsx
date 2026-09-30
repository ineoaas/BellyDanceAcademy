import { PageHero } from "@/components/ui";

const FAQS = [
  {
    q: "How long do I have access to a course?",
    a: "Lifetime access. Courses here are a one-time purchase, not a subscription — once you buy a course, it's yours to rewatch whenever you like.",
  },
  {
    q: "Can I watch a course before buying it?",
    a: "Yes — courses include a free preview lesson you can watch right on the course page, no account required.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Card, Apple Pay, and Google Pay, all through Stripe. We never see or store your card details ourselves.",
  },
  {
    q: "How do refunds work?",
    a: "Reach out through the Contact page with your purchase details and we'll take a look. We handle these by hand rather than an automatic policy, since every situation is a little different.",
  },
  {
    q: "How do instructors get paid?",
    a: "Instructors keep the majority of every sale, paid out automatically to their own bank account through Stripe Connect — the platform only takes a commission off the top.",
  },
  {
    q: "How do I become an instructor?",
    a: "Apply on the Become an Instructor page. Every application is reviewed before an account is activated — we're looking for real performance and teaching experience.",
  },
  {
    q: "I forgot my password — what do I do?",
    a: 'Use the "Forgot password" link on the login page. You\'ll get an emailed link to set a new one.',
  },
];

export default function FaqPage() {
  return (
    <main className="flex-1">
      <PageHero eyebrow="FAQ" title="Frequently Asked Questions" />
      <section className="py-14">
        <dl className="mx-auto max-w-2xl space-y-6 px-6">
          {FAQS.map((item) => (
            <div key={item.q} className="border-b border-dotted border-gold/40 pb-6">
              <dt className="mb-2 font-display text-lg text-burgundy">{item.q}</dt>
              <dd className="text-sm text-ink/70">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
