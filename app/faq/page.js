export const metadata = { title: "FAQ — Belly Dance Academy" };

const FAQS = [
  {
    q: "How long do I have access to a course?",
    a: "Lifetime access. Courses here are a one-time purchase, not a subscription — once you buy a course, it's yours to rewatch whenever you like.",
  },
  {
    q: "Can I watch a course before buying it?",
    a: "Yes — every course has at least one full preview lesson you can watch for free, no account required, right on the course page.",
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
    a: "Use the \"Forgot password\" link on the login page. You'll get an emailed link to set a new one.",
  },
];

export default function FaqPage() {
  return (
    <main className="flex-1">
      <section className="bg-burgundy-deep text-ivory">
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-14">
          <span className="text-xs tracking-[0.24em] uppercase text-gold font-medium">FAQ</span>
          <h1 className="font-display text-3xl md:text-4xl mt-3">Frequently Asked Questions</h1>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          {FAQS.map((item) => (
            <div key={item.q} className="border-b border-dotted border-gold/40 pb-6">
              <h2 className="font-display text-lg text-burgundy mb-2">{item.q}</h2>
              <p className="text-ink/70 text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
