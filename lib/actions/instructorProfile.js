"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { upsertProfile } from "@/lib/instructorProfiles";

export async function updateInstructorProfileAction(formData) {
  const instructor = await requireUser("instructor");

  const city = formData.get("city")?.toString().trim() ?? "";
  const bio = formData.get("bio")?.toString().trim() ?? "";
  const credentials = formData.get("credentials")?.toString().trim() ?? "";

  upsertProfile(instructor.id, { name: instructor.name, city, bio, credentials });
  redirect("/instructor/profile?saved=1");
}
