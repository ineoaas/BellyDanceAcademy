const TONES = {
  success: "bg-emerald-800/10 text-emerald-800",
  danger: "bg-burgundy/10 text-burgundy",
  warning: "bg-gold/20 text-[#7a5d1d]",
};

/** Maps every status the API can return to a tone. */
const TONE_BY_STATUS = {
  ACTIVE: "success",
  LIVE: "success",
  VISIBLE: "success",
  PAID: "success",
  SUSPENDED: "danger",
  REJECTED: "danger",
  FAILED: "danger",
  CANCELED: "danger",
};

export function StatusBadge({ status, label }) {
  const tone = TONE_BY_STATUS[status] ?? "warning";
  return (
    <span className={`inline-block px-2.5 py-1 text-[0.6rem] font-semibold uppercase ${TONES[tone]}`}>
      {label ?? status.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}
