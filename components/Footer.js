import Link from "next/link";

const LINKS = [
  { href: "/courses", label: "Browse Courses" },
  { href: "/instructors", label: "Instructors" },
  { href: "/become-an-instructor", label: "Become an Instructor" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-burgundy-dark text-gold-pale/60 text-center py-8 text-xs tracking-wide">
      <div className="font-script text-2xl text-gold-light mb-3">Belly Dance Academy</div>
      <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4 uppercase tracking-widest text-[0.65rem]">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-gold-pale">
            {link.label}
          </Link>
        ))}
      </nav>
      © {new Date().getFullYear()} Belly Dance Academy
    </footer>
  );
}
