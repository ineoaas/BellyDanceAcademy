import { Link } from "react-router";

const CTA_BASE =
  "group relative inline-flex items-center justify-center gap-2 px-7 py-3 text-xs font-medium tracking-[0.14em] uppercase transition-colors disabled:opacity-50";

const CTA_VARIANTS = {
  primary: "bg-burgundy-deep text-gold-pale hover:bg-burgundy",
  outline: "border border-gold text-current hover:bg-gold/10",
  outlineLight: "border border-gold text-gold-pale hover:bg-gold/10",
};

/** Gold corner brackets that slide in on hover — the brand's signature detail. */
function Corners() {
  return (
    <>
      <span className="pointer-events-none absolute -top-1 -left-1 h-2 w-2 -translate-x-1 translate-y-1 border-t border-l border-gold opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
      <span className="pointer-events-none absolute -right-1 -bottom-1 h-2 w-2 translate-x-1 -translate-y-1 border-r border-b border-gold opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
    </>
  );
}

/** The large call-to-action button. Renders a router link when given `to`. */
export function Button({ to, variant = "primary", className = "", children, ...props }) {
  const classes = `${CTA_BASE} ${CTA_VARIANTS[variant]} ${className}`;
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
        <Corners />
      </Link>
    );
  }
  return (
    <button type="button" className={classes} {...props}>
      {children}
      <Corners />
    </button>
  );
}

const ACTION_BASE = "inline-block px-3 py-2 text-xs tracking-widest uppercase disabled:opacity-40";

const ACTION_VARIANTS = {
  solid: "bg-burgundy-deep text-gold-pale hover:bg-burgundy",
  outline: "border border-gold hover:bg-gold/10",
  danger: "border border-burgundy text-burgundy hover:bg-burgundy/5",
  gold: "bg-gold font-medium text-burgundy-deep hover:bg-gold-light",
};

/** Compact buttons for forms, tables and toolbars. */
export function ActionButton({ to, variant = "outline", className = "", children, ...props }) {
  const classes = `${ACTION_BASE} ${ACTION_VARIANTS[variant]} ${className}`;
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
