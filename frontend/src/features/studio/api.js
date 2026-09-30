import { http } from "@/lib/http";

export const studioApi = {
  dashboard: () => http.get("/instructor/dashboard"),
  stripeOnboardingLink: () => http.post("/instructor/stripe/onboarding-link"),
  requestPayout: () => http.post("/instructor/payouts"),
  profile: () => http.get("/instructor/profile"),
  saveProfile: (profile) => http.put("/instructor/profile", profile),
  createCourse: (course) => http.post("/instructor/courses", course),
  course: (courseId) => http.get(`/instructor/courses/${courseId}`),
  updateCourse: (courseId, course) => http.put(`/instructor/courses/${courseId}`, course),
  lessons: (courseId) => http.get(`/instructor/courses/${courseId}/lessons`),
  addLesson: (courseId, lesson) => http.post(`/instructor/courses/${courseId}/lessons`, lesson),
  moveLesson: (lessonId, direction) => http.post(`/instructor/lessons/${lessonId}/move`, { direction }),
  startVideoUpload: (lessonId) => http.post(`/instructor/lessons/${lessonId}/video-upload`),
};
