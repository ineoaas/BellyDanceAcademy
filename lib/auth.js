import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser, createSession } from "@/lib/sessions";

export const SESSION_COOKIE = "bda_session";

export const DASHBOARD_BY_ROLE = {
  student: "/student",
  instructor: "/instructor",
  admin: "/admin",
};

// Creates a session for a user and sets the cookie that carries it —
// the one piece of "log this person in" logic shared by real login,
// registration, and password reset.
export async function startSession(userId) {
  const { token, expiresAt } = createSession(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

// Reads the session cookie and returns the logged-in user, or null.
// Safe to call from any Server Component — doesn't redirect on its own.
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return getSessionUser(token);
}

// Guards a page that requires a specific role. Redirects to login if no
// one's signed in, or to the account's real dashboard if they're signed
// in as the wrong role. Only returns once access is actually allowed.
export async function requireUser(role) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?as=${role}&redirected=1`);
  }

  if (user.role !== role) {
    redirect(DASHBOARD_BY_ROLE[user.role] ?? "/");
  }

  return user;
}
