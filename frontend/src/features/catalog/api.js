import { http, toQueryString } from "@/lib/http";

export const catalogApi = {
  search: (filters) => http.get(`/courses${toQueryString(filters)}`),
  styles: () => http.get("/courses/styles"),
  detail: (slug) => http.get(`/courses/${encodeURIComponent(slug)}`),
  reviews: (slug) => http.get(`/courses/${encodeURIComponent(slug)}/reviews`),
  submitReview: (slug, review) => http.put(`/courses/${encodeURIComponent(slug)}/reviews/mine`, review),
  startCheckout: (slug) => http.post(`/courses/${encodeURIComponent(slug)}/checkout`),
};
