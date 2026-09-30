import { DashboardLayout } from "@/components/layout/DashboardLayout";

const LINKS = [
  { to: "/instructor", label: "Overview", end: true },
  { to: "/instructor/courses/new", label: "Create New Course" },
  { to: "/instructor/profile", label: "Edit Profile" },
];

export default function StudioLayout() {
  return <DashboardLayout links={LINKS} />;
}
