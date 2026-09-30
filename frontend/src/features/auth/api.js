import { http } from "@/lib/http";

export const authApi = {
  session: () => http.get("/auth/session"),
  login: (credentials) => http.post("/auth/login", credentials),
  logout: () => http.post("/auth/logout"),
  registerStudent: (details) => http.post("/auth/register", details),
  applyAsInstructor: (details) => http.post("/auth/instructor-applications", details),
  requestPasswordReset: (email) => http.post("/auth/password-reset", { email }),
  confirmPasswordReset: ({ token, password }) => http.post("/auth/password-reset/confirm", { token, password }),
};
