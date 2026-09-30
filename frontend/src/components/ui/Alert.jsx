const TONES = {
  error: "bg-burgundy/10 text-burgundy",
  success: "bg-emerald-800/10 text-emerald-800",
  info: "border border-gold/40 bg-gold/15 text-ink/75",
};

export function Alert({ tone = "info", className = "", children }) {
  if (!children) return null;
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`px-4 py-3 text-sm ${TONES[tone]} ${className}`}>
      {children}
    </p>
  );
}

/** Shows a failed mutation/query's server message, if there is one. */
export function ErrorAlert({ error, className }) {
  return (
    <Alert tone="error" className={className}>
      {error?.message}
    </Alert>
  );
}
