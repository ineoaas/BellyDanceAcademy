"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { setCourseStatus } from "@/lib/courses";
import { setReviewStatus } from "@/lib/reviews";
import { setUserStatus, userHasDependents, deleteUser } from "@/lib/users";
import { setCommissionRatePercent } from "@/lib/settings";
import { createAnnouncement, setAnnouncementActive } from "@/lib/announcements";

export async function approveCourseAction(formData) {
  await requireUser("admin");
  setCourseStatus(Number(formData.get("courseId")), "live");
  redirect("/admin/courses");
}

export async function rejectCourseAction(formData) {
  await requireUser("admin");
  setCourseStatus(Number(formData.get("courseId")), "rejected");
  redirect("/admin/courses");
}

export async function setReviewStatusAction(formData) {
  await requireUser("admin");
  const reviewId = Number(formData.get("reviewId"));
  const status = formData.get("status")?.toString() === "hidden" ? "hidden" : "visible";
  setReviewStatus(reviewId, status);
  redirect("/admin/reviews");
}

export async function approveApplicationAction(formData) {
  await requireUser("admin");
  setUserStatus(Number(formData.get("userId")), "active");
  redirect("/admin/applications");
}

export async function rejectApplicationAction(formData) {
  await requireUser("admin");
  setUserStatus(Number(formData.get("userId")), "rejected");
  redirect("/admin/applications");
}

export async function suspendUserAction(formData) {
  const admin = await requireUser("admin");
  const userId = Number(formData.get("userId"));
  if (userId === admin.id) redirect("/admin/users?error=self");
  setUserStatus(userId, "suspended");
  redirect("/admin/users");
}

export async function activateUserAction(formData) {
  await requireUser("admin");
  setUserStatus(Number(formData.get("userId")), "active");
  redirect("/admin/users");
}

// Blocks rather than silently orphaning data — see the note in
// lib/users.js's userHasDependents.
export async function deleteUserAction(formData) {
  const admin = await requireUser("admin");
  const userId = Number(formData.get("userId"));

  if (userId === admin.id) redirect("/admin/users?error=self");
  if (userHasDependents(userId)) redirect("/admin/users?error=has-dependents");

  deleteUser(userId);
  redirect("/admin/users?deleted=1");
}

// Only affects purchases from this point on — see the note in
// lib/settings.js's setCommissionRatePercent.
export async function updateCommissionRateAction(formData) {
  await requireUser("admin");
  const percent = Number(formData.get("percent"));

  if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
    redirect("/admin/commissions?error=invalid");
  }

  setCommissionRatePercent(percent);
  redirect("/admin/commissions?saved=1");
}

export async function createAnnouncementAction(formData) {
  await requireUser("admin");
  const message = formData.get("message")?.toString().trim() ?? "";
  if (!message) redirect("/admin/announcements?error=missing");

  createAnnouncement(message);
  redirect("/admin/announcements");
}

export async function toggleAnnouncementAction(formData) {
  await requireUser("admin");
  const id = Number(formData.get("id"));
  const isActive = formData.get("isActive")?.toString() === "1";
  setAnnouncementActive(id, isActive);
  redirect("/admin/announcements");
}
