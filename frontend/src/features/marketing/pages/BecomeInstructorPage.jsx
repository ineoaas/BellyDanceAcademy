import { Link } from "react-router";
import { InstructorApplicationForm } from "@/features/auth/components/InstructorApplicationForm";

const PERKS = [
  "Set your own prices and keep the majority of every sale",
  "Automatic payouts straight to your bank account",
  "We handle checkout, hosting, and access — you upload and teach",
  "Every application is reviewed, so students trust what they buy",
];

export default function BecomeInstructorPage() {
  return (
    <main className="flex-1">
      <section className="bg-burgundy-deep text-ivory">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-14 md:grid-cols-2">
          <div>
            <span className="eyebrow text-gold">Become an Instructor</span>
            <h1 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
              Turn your choreography into a course of its own
            </h1>
            <p className="mt-4 max-w-md text-gold-pale/80">
              Upload your lessons, set your own price, and keep the majority of every sale. We handle
              checkout, video hosting, and payouts automatically — you focus on teaching.
            </p>
            <ul className="mt-7 space-y-3 text-sm text-gold-pale/80">
              {PERKS.map((perk) => (
                <li key={perk}>— {perk}</li>
              ))}
            </ul>
          </div>

          <div className="bg-ivory p-7 text-ink">
            <h2 className="mb-4 font-display text-xl">Apply to Teach</h2>
            <InstructorApplicationForm />
            <p className="mt-4 text-xs text-ink/50">
              Already applied?{" "}
              <Link to="/login?as=instructor" className="underline">
                Log in
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
