import { DashboardLayout } from "@/components/layout/DashboardLayout";

const LINKS = [
  { to: "/student", label: "My Courses", end: true },
  { to: "/courses", label: "Browse Courses" },
  { to: "/student/wishlist", label: "Wishlist" },
  { to: "/student/settings", label: "Profile Settings" },
];

export default function StudentLayout() {
  return <DashboardLayout links={LINKS} />;
}
