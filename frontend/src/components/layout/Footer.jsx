import { Link } from "react-router";

const LINKS = [
  { to: "/courses", label: "Browse Courses" },
  { to: "/instructors", label: "Instructors" },
  { to: "/become-an-instructor", label: "Become an Instructor" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { to: "/terms", label: "Terms of Service" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/refund-policy", label: "Refund Policy" },
];

export function Footer() {
  return (
    <footer className="bg-burgundy-dark py-8 text-center text-xs tracking-wide text-gold-pale/60">
      <div className="mb-3 font-script text-2xl text-gold-light">Belly Dance Academy</div>
      <nav className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[0.65rem] tracking-widest uppercase">
        {LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="hover:text-gold-pale">
            {link.label}
          </Link>
        ))}
      </nav>
      <nav aria-label="Legal" className="mb-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[0.65rem]">
        {LEGAL_LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="hover:text-gold-pale hover:underline">
            {link.label}
          </Link>
        ))}
      </nav>
      © {new Date().getFullYear()} Belly Dance Academy
    </footer>
  );
}
