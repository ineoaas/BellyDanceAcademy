import { http } from "@/lib/http";

export const adminApi = {
  overview: () => http.get("/admin/overview"),
  applications: () => http.get("/admin/instructor-applications"),
  approveApplication: (userId) => http.post(`/admin/instructor-applications/${userId}/approve`),
  rejectApplication: (userId) => http.post(`/admin/instructor-applications/${userId}/reject`),
  pendingCourses: () => http.get("/admin/courses/pending"),
  approveCourse: (courseId) => http.post(`/admin/courses/${courseId}/approve`),
  rejectCourse: (courseId) => http.post(`/admin/courses/${courseId}/reject`),
  reviews: () => http.get("/admin/reviews"),
  setReviewStatus: (reviewId, status) => http.put(`/admin/reviews/${reviewId}/status`, { status }),
  users: () => http.get("/admin/users"),
  suspendUser: (userId) => http.post(`/admin/users/${userId}/suspend`),
  reactivateUser: (userId) => http.post(`/admin/users/${userId}/reactivate`),
  deleteUser: (userId) => http.delete(`/admin/users/${userId}`),
  commission: () => http.get("/admin/settings/commission"),
  setCommission: (ratePercent) => http.put("/admin/settings/commission", { ratePercent }),
  payouts: () => http.get("/admin/payouts"),
  announcements: () => http.get("/admin/announcements"),
  publishAnnouncement: (message) => http.post("/admin/announcements", { message }),
  setAnnouncementActive: (id, active) => http.put(`/admin/announcements/${id}/active`, { active }),
};
