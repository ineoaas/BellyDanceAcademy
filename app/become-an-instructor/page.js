import { applyAsInstructorAction } from "@/lib/actions/instructorApplications";

export const metadata = { title: "Become an Instructor — Belly Dance Academy" };

const ERRORS = {
  missing: "Please fill in your name and email.",
  short: "Password must be at least 8 characters.",
  mismatch: "Passwords don't match.",
  exists: "An account with that email already exists — try logging in instead.",
};

export default async function BecomeAnInstructorPage({ searchParams }) {
  const search = await searchParams;
  const applied = search?.applied === "1";
  const errorMessage = ERRORS[search?.error];

  return (
    <main className="flex-1">
      <section className="bg-burgundy-deep text-ivory">
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-14 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs tracking-[0.24em] uppercase text-gold font-medium">
              Become an Instructor
            </span>
            <h1 className="font-display text-3xl md:text-4xl mt-3 leading-tight">
              Turn your choreography into a course of its own
            </h1>
            <p className="text-gold-pale/80 mt-4 max-w-md">
              Upload your lessons, set your own price, and keep the majority of every sale. We
              handle checkout, video hosting, and payouts automatically — you focus on teaching.
            </p>
            <ul className="mt-7 space-y-3 text-sm text-gold-pale/80">
              <li>— Set your own prices and keep the majority of every sale</li>
              <li>— Automatic payouts straight to your bank account</li>
              <li>— We handle checkout, hosting, and access — you upload and teach</li>
              <li>— Every application is reviewed, so students trust what they buy</li>
            </ul>
          </div>

          <div className="bg-ivory text-ink p-7">
            <h2 className="font-display text-xl mb-4">Apply to Teach</h2>

            {applied ? (
              <p className="text-sm text-ink/70">
                Thanks for applying — we&apos;ll review your application and email you once your
                account is activated.
              </p>
            ) : (
              <form action={applyAsInstructorAction} className="flex flex-col gap-3">
                <input type="hidden" name="returnTo" value="/become-an-instructor" />
                {errorMessage && <p className="text-xs text-burgundy">{errorMessage}</p>}
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  required
                  className="border border-gold/40 bg-ivory px-3 py-2 text-sm"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  className="border border-gold/40 bg-ivory px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="border border-gold/40 bg-ivory px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  required
                  className="border border-gold/40 bg-ivory px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-6 py-3 mt-2"
                >
                  Submit Application
                </button>
                <p className="text-xs text-ink/50">
                  Already applied?{" "}
                  <a href="/login?as=instructor" className="underline">
                    Log in
                  </a>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
