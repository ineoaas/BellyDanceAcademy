export function StatTile({ label, value }) {
  return (
    <div className="border border-t-2 border-gold/30 border-t-gold bg-ivory p-4">
      <span className="text-[0.62rem] tracking-widest text-ink/55 uppercase">{label}</span>
      <strong className="mt-1 block font-display text-2xl text-burgundy">{value}</strong>
    </div>
  );
}
