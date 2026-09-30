/**
 * Only same-site paths are allowed as post-login destinations, so a crafted
 * "?redirect=https://evil.example" link can't bounce users off-site.
 */
export function safeRedirectPath(candidate, fallback = "/") {
  if (typeof candidate !== "string") return fallback;
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.startsWith("/\\")) return fallback;
  return candidate;
}
