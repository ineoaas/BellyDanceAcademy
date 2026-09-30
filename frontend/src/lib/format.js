const dollarsExact = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dollarsWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Ledger amounts: always two decimals — "$1,180.00". */
export function formatMoney(cents) {
  return dollarsExact.format(cents / 100);
}

/** Shop prices: drop ".00" — "$59", but "$59.50". */
export function formatPrice(cents) {
  return cents % 100 === 0 ? dollarsWhole.format(cents / 100) : dollarsExact.format(cents / 100);
}

export function formatDate(isoInstant) {
  return shortDate.format(new Date(isoInstant));
}

/** 760 → "12:40", 3725 → "1:02:05". */
export function formatDuration(totalSeconds) {
  if (totalSeconds == null) return "";
  const seconds = Math.round(totalSeconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/** 4.4 → "★★★★☆" (whole stars only — the design has no half-star). */
export function stars(rating) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

export function firstName(fullName) {
  return fullName.trim().split(/\s+/)[0];
}

export function initial(text) {
  return text.trim().charAt(0).toUpperCase() || "?";
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** "12.50" (dollars, from a form input) → 1250 cents; empty → null. */
export function dollarsToCents(value) {
  if (value === "" || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) : null;
}

export function centsToDollars(cents) {
  return cents == null ? "" : String(cents / 100);
}
