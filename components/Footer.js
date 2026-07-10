export default function Footer() {
  return (
    <footer className="bg-burgundy-dark text-gold-pale/60 text-center py-8 text-xs tracking-wide">
      <div className="font-script text-2xl text-gold-light mb-1">Belly Dance Academy</div>
      © {new Date().getFullYear()} · design preview, no data is saved.
    </footer>
  );
}
