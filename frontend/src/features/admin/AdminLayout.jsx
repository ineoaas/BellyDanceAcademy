import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAdminOverview } from "./hooks";

export default function AdminLayout() {
  const { data: overview } = useAdminOverview();

  const links = [
    { to: "/admin", label: "Overview", end: true },
    { to: "/admin/applications", label: "Instructor Applications", badge: overview?.pendingApplications },
    { to: "/admin/courses", label: "Courses", badge: overview?.pendingCourses },
    { to: "/admin/reviews", label: "Reviews" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/commissions", label: "Commissions" },
    { to: "/admin/payouts", label: "Payouts" },
    { to: "/admin/announcements", label: "Announcements" },
  ];

  return <DashboardLayout links={links} />;
}
