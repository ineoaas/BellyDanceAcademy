/** The centred ivory card used by every sign-in related page. */
export function AuthCard({ title, subtitle, children }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-burgundy-deep px-5 py-12">
      <div className="w-full max-w-sm bg-ivory p-9">
        {title && <h1 className="mb-1 font-display text-xl">{title}</h1>}
        {subtitle && <p className="mb-6 text-sm text-ink/60">{subtitle}</p>}
        {children}
      </div>
    </main>
  );
}
