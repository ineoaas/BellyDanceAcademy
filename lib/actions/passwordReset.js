"use server";

import { redirect } from "next/navigation";
import { findUserByEmail, updateUserPassword } from "@/lib/users";
import { createResetToken, findUserIdByResetToken, deleteResetToken } from "@/lib/passwordResets";
import { sendPasswordResetEmail } from "@/lib/email";
import { DASHBOARD_BY_ROLE, startSession } from "@/lib/auth";

export async function requestPasswordResetAction(formData) {
  const email = formData.get("email")?.toString().trim() ?? "";
  const user = findUserByEmail(email);

  // Always redirect the same way whether or not the account exists —
  // otherwise this form could be used to check who has an account here.
  if (user) {
    const rawToken = createResetToken(user.id);
    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  redirect("/forgot-password?sent=1");
}

export async function resetPasswordAction(formData) {
  const token = formData.get("token")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

  const userId = findUserIdByResetToken(token);
  if (!userId) {
    redirect("/reset-password?error=invalid");
  }
  if (password.length < 8) {
    redirect(`/reset-password?token=${token}&error=short`);
  }
  if (password !== confirmPassword) {
    redirect(`/reset-password?token=${token}&error=mismatch`);
  }

  const user = updateUserPassword(userId, password);
  deleteResetToken(token);

  // They just proved ownership of the account via the emailed link —
  // log them straight in rather than making them type the password again.
  await startSession(user.id);

  redirect(DASHBOARD_BY_ROLE[user.role] ?? "/student");
}
