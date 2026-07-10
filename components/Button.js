import Link from "next/link";

const baseClasses =
  "relative inline-flex items-center justify-center gap-2 px-7 py-3 text-xs tracking-[0.14em] uppercase font-medium transition-colors group";

// Picks the Tailwind classes for a button style. Using plain if/else here
// instead of a lookup object keeps it easy to follow line by line.
function getVariantClasses(variant) {
  if (variant === "outline") {
    return "border border-gold text-current hover:bg-gold/10";
  }
  if (variant === "outlineLight") {
    return "border border-gold text-gold-pale hover:bg-gold/10";
  }
  return "bg-burgundy-deep text-gold-pale hover:bg-burgundy";
}

function Corners() {
  return (
    <>
      <span className="pointer-events-none absolute -top-1 -left-1 h-2 w-2 border-t border-l border-gold opacity-0 -translate-x-1 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" />
      <span className="pointer-events-none absolute -bottom-1 -right-1 h-2 w-2 border-b border-r border-gold opacity-0 translate-x-1 -translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" />
    </>
  );
}

export default function Button({
  href,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  children,
}) {
  const classes = baseClasses + " " + getVariantClasses(variant) + " " + className;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
        <Corners />
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
      <Corners />
    </button>
  );
}
