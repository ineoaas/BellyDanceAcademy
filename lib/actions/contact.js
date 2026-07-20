"use server";

import { redirect } from "next/navigation";
import { sendContactMessageEmail } from "@/lib/email";

export async function submitContactAction(formData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const message = formData.get("message")?.toString().trim() ?? "";

  if (!name || !email || !message) {
    redirect("/contact?error=missing");
  }

  await sendContactMessageEmail({ name, email, message });
  redirect("/contact?sent=1");
}
