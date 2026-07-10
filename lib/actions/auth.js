"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkLogin, findUserByEmail, createUser } from "@/lib/users";
import { destroySession } from "@/lib/sessions";
import { SESSION_COOKIE, DASHBOARD_BY_ROLE, startSession } from "@/lib/auth";

export async function loginAction(formData) {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const as = formData.get("as")?.toString() ?? "student";

  const result = checkLogin(email, password);
  if (!result.ok) {
    redirect(`/login?as=${as}&error=${result.reason === "pending" ? "pending" : "1"}`);
  }
  const user = result.user;

  await startSession(user.id);

  const redirectTo = formData.get("redirect")?.toString();
  redirect(redirectTo || DASHBOARD_BY_ROLE[user.role] || "/student");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) destroySession(token);
  cookieStore.delete(SESSION_COOKIE);
  redirect("/");
}

// Student self-registration only — logs in immediately. Instructor signup
// is applyAsInstructorAction in lib/actions/instructorApplications.js,
// which creates a pending account instead of an active one.
export async function registerAction(formData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";
  const redirectTo = formData.get("redirect")?.toString();

  const signupUrl = "/login?as=student&mode=signup";

  if (!name || !email) {
    redirect(`${signupUrl}&error=missing`);
  }
  if (password.length < 8) {
    redirect(`${signupUrl}&error=short`);
  }
  if (password !== confirmPassword) {
    redirect(`${signupUrl}&error=mismatch`);
  }
  if (findUserByEmail(email)) {
    redirect(`${signupUrl}&error=exists`);
  }

  const user = createUser({ name, email, password, role: "student" });
  await startSession(user.id);

  redirect(redirectTo || DASHBOARD_BY_ROLE[user.role] || "/student");
}
