import { initial } from "@/lib/format";

const SIZES = {
  sm: "h-11 w-11 text-base",
  md: "h-14 w-14 text-xl",
  lg: "h-20 w-20 text-2xl",
  xl: "h-28 w-28 text-3xl",
};

/** A round monogram — stands in for avatars and course artwork. */
export function Medallion({ text, size = "md", className = "bg-cream border border-gold/50 text-burgundy" }) {
  return (
    <div aria-hidden="true" className={`medallion font-display ${SIZES[size]} ${className}`}>
      {initial(text)}
    </div>
  );
}
