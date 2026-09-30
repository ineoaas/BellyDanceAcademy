/** The dark burgundy banner at the top of public pages. */
export function PageHero({ eyebrow, title, children }) {
  return (
    <section className="bg-burgundy-deep text-ivory">
      <div className="mx-auto max-w-5xl px-6 py-14">
        {eyebrow && <span className="eyebrow text-gold">{eyebrow}</span>}
        <h1 className="mt-3 max-w-2xl font-display text-3xl md:text-4xl">{title}</h1>
        {children && <div className="mt-4 max-w-md text-gold-pale/80">{children}</div>}
      </div>
    </section>
  );
}

/** Heading block at the top of a dashboard page. */
export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <span className="text-xs font-medium tracking-[0.2em] text-burgundy uppercase">{eyebrow}</span>
        )}
        <h1 className="mt-1 font-display text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-lg text-sm text-ink/55">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, light = false }) {
  return (
    <div className="mb-10 text-center">
      <span className={`eyebrow ${light ? "text-gold" : "text-burgundy"}`}>{eyebrow}</span>
      <h2 className="mt-2 font-display text-2xl md:text-3xl">{title}</h2>
    </div>
  );
}
