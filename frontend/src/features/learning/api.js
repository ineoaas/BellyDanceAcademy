import { http } from "@/lib/http";

export const learningApi = {
  watch: (slug, lessonId) => http.get(`/courses/${encodeURIComponent(slug)}/lessons/${lessonId}/watch`),
  reportProgress: (lessonId, positionSeconds) => http.put(`/me/lessons/${lessonId}/progress`, { positionSeconds }),
};
