/** The ivory card that holds most dashboard content. */
export function Panel({ title, action, className = "", children }) {
  return (
    <section className={`border border-gold/30 bg-ivory p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="font-display text-lg">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
