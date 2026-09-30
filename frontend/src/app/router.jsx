import { createBrowserRouter } from "react-router";
import { RequireRole } from "@/features/auth/RequireRole";
import NotFoundPage from "@/features/marketing/pages/NotFoundPage";
import { RootLayout } from "./RootLayout";
import { RouteError } from "./RouteError";

/** Code-splits each page into its own chunk, loaded on first visit. */
const page = (load) => () => load().then((module) => ({ Component: module.default }));

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    ErrorBoundary: RouteError,
    children: [
      // Public
      { index: true, lazy: page(() => import("@/features/marketing/pages/HomePage")) },
      { path: "about", lazy: page(() => import("@/features/marketing/pages/AboutPage")) },
      { path: "faq", lazy: page(() => import("@/features/marketing/pages/FaqPage")) },
      { path: "contact", lazy: page(() => import("@/features/marketing/pages/ContactPage")) },
      { path: "become-an-instructor", lazy: page(() => import("@/features/marketing/pages/BecomeInstructorPage")) },
      { path: "courses", lazy: page(() => import("@/features/catalog/pages/CoursesPage")) },
      { path: "courses/:slug", lazy: page(() => import("@/features/catalog/pages/CourseDetailPage")) },
      { path: "courses/:slug/watch/:lessonId", lazy: page(() => import("@/features/learning/pages/WatchLessonPage")) },
      { path: "instructors", lazy: page(() => import("@/features/instructors/pages/InstructorsPage")) },
      { path: "instructors/:slug", lazy: page(() => import("@/features/instructors/pages/InstructorProfilePage")) },
      { path: "terms", lazy: page(() => import("@/features/legal/pages/TermsPage")) },
      { path: "privacy", lazy: page(() => import("@/features/legal/pages/PrivacyPage")) },
      { path: "refund-policy", lazy: page(() => import("@/features/legal/pages/RefundPolicyPage")) },

      // Auth
      { path: "login", lazy: page(() => import("@/features/auth/pages/LoginPage")) },
      { path: "forgot-password", lazy: page(() => import("@/features/auth/pages/ForgotPasswordPage")) },
      { path: "reset-password", lazy: page(() => import("@/features/auth/pages/ResetPasswordPage")) },

      // Student
      {
        path: "student",
        element: <RequireRole role="STUDENT" />,
        children: [
          {
            lazy: page(() => import("@/features/student/StudentLayout")),
            children: [
              { index: true, lazy: page(() => import("@/features/student/pages/StudentDashboardPage")) },
              { path: "wishlist", lazy: page(() => import("@/features/student/pages/WishlistPage")) },
              { path: "settings", lazy: page(() => import("@/features/student/pages/SettingsPage")) },
            ],
          },
        ],
      },

      // Instructor studio
      {
        path: "instructor",
        element: <RequireRole role="INSTRUCTOR" />,
        children: [
          {
            lazy: page(() => import("@/features/studio/StudioLayout")),
            children: [
              { index: true, lazy: page(() => import("@/features/studio/pages/StudioDashboardPage")) },
              { path: "profile", lazy: page(() => import("@/features/studio/pages/EditProfilePage")) },
              { path: "courses/new", lazy: page(() => import("@/features/studio/pages/NewCoursePage")) },
              { path: "courses/:courseId", lazy: page(() => import("@/features/studio/pages/ManageLessonsPage")) },
              { path: "courses/:courseId/edit", lazy: page(() => import("@/features/studio/pages/EditCoursePage")) },
            ],
          },
        ],
      },

      // Admin
      {
        path: "admin",
        element: <RequireRole role="ADMIN" />,
        children: [
          {
            lazy: page(() => import("@/features/admin/AdminLayout")),
            children: [
              { index: true, lazy: page(() => import("@/features/admin/pages/OverviewPage")) },
              { path: "applications", lazy: page(() => import("@/features/admin/pages/ApplicationsPage")) },
              { path: "courses", lazy: page(() => import("@/features/admin/pages/CoursesPage")) },
              { path: "reviews", lazy: page(() => import("@/features/admin/pages/ReviewsPage")) },
              { path: "users", lazy: page(() => import("@/features/admin/pages/UsersPage")) },
              { path: "commissions", lazy: page(() => import("@/features/admin/pages/CommissionsPage")) },
              { path: "payouts", lazy: page(() => import("@/features/admin/pages/PayoutsPage")) },
              { path: "announcements", lazy: page(() => import("@/features/admin/pages/AnnouncementsPage")) },
            ],
          },
        ],
      },

      { path: "*", Component: NotFoundPage },
    ],
  },
]);
