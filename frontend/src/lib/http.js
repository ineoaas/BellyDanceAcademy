/**
 * The single way the app talks to the API.
 *
 * - Same-origin requests (Vite proxy in dev, nginx in production), so the
 *   HttpOnly session cookie travels automatically.
 * - State-changing requests echo the XSRF-TOKEN cookie as a header
 *   (double-submit CSRF protection).
 * - Failures become an ApiError carrying the server's RFC 7807 fields.
 */

const API_BASE = "/api";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_COOKIE = "XSRF-TOKEN";
const CSRF_HEADER = "X-XSRF-TOKEN";

export class ApiError extends Error {
  constructor(status, problem) {
    super(problem?.detail ?? defaultMessage(status));
    this.name = "ApiError";
    this.status = status;
    this.code = problem?.code ?? null;
    this.fieldErrors = problem?.fieldErrors ?? {};
  }
}

function defaultMessage(status) {
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  if (status === 404) return "We couldn't find that.";
  return "That request didn't work. Please try again.";
}

function readCookie(name) {
  const match = document.cookie.split("; ").find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

/** The server sets the CSRF cookie on the session call; make sure it exists before a write. */
async function ensureCsrfToken() {
  if (!readCookie(CSRF_COOKIE)) {
    await fetch(`${API_BASE}/auth/session`, { credentials: "same-origin" });
  }
  return readCookie(CSRF_COOKIE);
}

async function request(method, path, { body, signal } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (!SAFE_METHODS.has(method)) {
    const token = await ensureCsrfToken();
    if (token) headers[CSRF_HEADER] = token;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      signal,
    });
  } catch (networkError) {
    if (networkError.name === "AbortError") throw networkError;
    throw new ApiError(0, { detail: "Can't reach the server. Check your connection and try again." });
  }

  const isJson = response.headers.get("content-type")?.includes("json");
  const data = response.status === 204 || !isJson ? null : await response.json();
  if (!response.ok) throw new ApiError(response.status, data);
  return data;
}

export const http = {
  get: (path, options) => request("GET", path, options),
  post: (path, body, options) => request("POST", path, { ...options, body }),
  put: (path, body, options) => request("PUT", path, { ...options, body }),
  delete: (path, options) => request("DELETE", path, options),
};

/** Builds "?a=1&b=2" from an object, skipping empty values. */
export function toQueryString(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}
