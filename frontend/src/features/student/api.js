import { http } from "@/lib/http";

export const studentApi = {
  enrollments: () => http.get("/me/enrollments"),
  wishlist: () => http.get("/me/wishlist"),
  addToWishlist: (courseId) => http.put(`/me/wishlist/${courseId}`),
  removeFromWishlist: (courseId) => http.delete(`/me/wishlist/${courseId}`),
  updateProfile: (profile) => http.put("/me/profile", profile),
  changePassword: (passwords) => http.put("/me/password", passwords),
};
