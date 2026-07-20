import { submitContactAction } from "@/lib/actions/contact";

export const metadata = { title: "Contact — Belly Dance Academy" };

const ERRORS = {
  missing: "Please fill in every field before sending.",
};

export default async function ContactPage({ searchParams }) {
  const search = await searchParams;
  const sent = search?.sent === "1";
  const errorMessage = ERRORS[search?.error];

  return (
    <main className="flex-1">
      <section className="bg-burgundy-deep text-ivory">
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-14">
          <span className="text-xs tracking-[0.24em] uppercase text-gold font-medium">Contact</span>
          <h1 className="font-display text-3xl md:text-4xl mt-3">Get in touch</h1>
          <p className="text-gold-pale/80 mt-4 max-w-md">
            Questions about a course, a purchase, or teaching with us — send a message and we&apos;ll
            reply by email.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-md mx-auto px-6">
          {sent && (
            <p className="bg-emerald-800/10 text-emerald-800 text-sm px-4 py-3 mb-6">
              Message sent — we&apos;ll get back to you by email.
            </p>
          )}
          {errorMessage && (
            <p className="bg-burgundy/10 text-burgundy text-sm px-4 py-3 mb-6">{errorMessage}</p>
          )}

          <form action={submitContactAction} className="flex flex-col gap-4">
            <label className="text-xs uppercase tracking-widest text-ink/60">
              Name
              <input
                type="text"
                name="name"
                required
                className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
              />
            </label>
            <label className="text-xs uppercase tracking-widest text-ink/60">
              Email
              <input
                type="email"
                name="email"
                required
                className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
              />
            </label>
            <label className="text-xs uppercase tracking-widest text-ink/60">
              Message
              <textarea
                name="message"
                required
                rows={5}
                className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
              />
            </label>
            <button
              type="submit"
              className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-6 py-3 self-start"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
