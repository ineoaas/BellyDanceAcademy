"use server";

import { redirect } from "next/navigation";
import { findUserByEmail, createUser } from "@/lib/users";
import { sendInstructorApplicationEmail } from "@/lib/email";

// Unlike student registration, this does NOT log the applicant in — the
// account is created with status "pending" and stays that way until an
// admin activates it (by hand for now; FR-5.2 will add a real approval
// screen). The applicant just sees a confirmation that it's under review.
export async function applyAsInstructorAction(formData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

  // Defaults to the login page's signup mode so existing callers there are
  // unaffected; the Become an Instructor page passes its own path instead
  // so a validation error lands back on the same form, not a different page.
  const signupUrl = formData.get("returnTo")?.toString() || "/login?as=instructor&mode=signup";
  const separator = signupUrl.includes("?") ? "&" : "?";

  if (!name || !email) {
    redirect(`${signupUrl}${separator}error=missing`);
  }
  if (password.length < 8) {
    redirect(`${signupUrl}${separator}error=short`);
  }
  if (password !== confirmPassword) {
    redirect(`${signupUrl}${separator}error=mismatch`);
  }
  if (findUserByEmail(email)) {
    redirect(`${signupUrl}${separator}error=exists`);
  }

  const applicant = createUser({ name, email, password, role: "instructor", status: "pending" });
  await sendInstructorApplicationEmail(applicant);

  redirect(`${signupUrl}${separator}applied=1`);
}
