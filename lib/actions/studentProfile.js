"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { findUserByEmail, updateProfile, updateUserPassword } from "@/lib/users";
import { verifyPassword } from "@/lib/password";

export async function updateProfileAction(formData) {
  const user = await requireUser("student");
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";

  if (!name || !email) redirect("/student/settings?error=missing");

  const existing = findUserByEmail(email);
  if (existing && existing.id !== user.id) {
    redirect("/student/settings?error=exists");
  }

  updateProfile(user.id, { name, email });
  redirect("/student/settings?saved=1");
}

export async function changePasswordAction(formData) {
  const user = await requireUser("student");
  const currentPassword = formData.get("currentPassword")?.toString() ?? "";
  const newPassword = formData.get("newPassword")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

  if (!verifyPassword(currentPassword, user.password_salt, user.password_hash)) {
    redirect("/student/settings?error=wrong-password");
  }
  if (newPassword.length < 8) {
    redirect("/student/settings?error=short");
  }
  if (newPassword !== confirmPassword) {
    redirect("/student/settings?error=mismatch");
  }

  updateUserPassword(user.id, newPassword);
  redirect("/student/settings?password-changed=1");
}
