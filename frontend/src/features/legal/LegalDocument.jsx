import { PageHero } from "@/components/ui";

export const CONTACT_EMAIL = "info@thebellydancecompany.ae";

/**
 * Shared layout for the policy pages. Each section's `body` is an array of
 * paragraphs; a nested array renders as a bulleted list.
 */
export function LegalDocument({ title, lastUpdated, intro, sections }) {
  return (
    <main className="flex-1">
      <PageHero eyebrow="Legal" title={title}>
        Last updated {lastUpdated}
      </PageHero>

      <article className="py-14">
        <div className="mx-auto max-w-3xl space-y-8 px-6 text-sm leading-relaxed text-ink/75">
          {intro && <p>{intro}</p>}
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-2 font-display text-xl text-burgundy">{section.heading}</h2>
              <div className="space-y-3">
                {section.body.map((block, index) =>
                  Array.isArray(block) ? (
                    <ul key={index} className="list-disc space-y-1 pl-5">
                      {block.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={index}>{block}</p>
                  ),
                )}
              </div>
            </section>
          ))}
          <p className="border-t border-dotted border-gold/40 pt-6">
            Questions about this policy? Email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-burgundy underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </article>
    </main>
  );
}
