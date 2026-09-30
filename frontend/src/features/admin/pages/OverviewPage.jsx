import { AsyncContent, PageHeader, Panel, StatTile } from "@/components/ui";
import { useCurrentUser } from "@/features/auth/hooks";
import { firstName, formatMoney, pluralize } from "@/lib/format";
import { useAdminOverview } from "../hooks";

export default function OverviewPage() {
  const user = useCurrentUser();
  const overview = useAdminOverview();

  return (
    <>
      <PageHeader eyebrow="Overview" title={`Welcome back, ${firstName(user.name)}`} />
      <AsyncContent query={overview}>
        {(stats) => (
          <>
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
              <StatTile label="Pending Applications" value={stats.pendingApplications} />
              <StatTile label="Pending Courses" value={stats.pendingCourses} />
              <StatTile label="Total Users" value={stats.totalUsers} />
              <StatTile label="Live Courses" value={stats.liveCourses} />
              <StatTile label="Platform Revenue" value={formatMoney(stats.platformRevenueCents)} />
            </div>
            <Panel title="Platform Snapshot">
              <p className="text-sm text-ink/65">
                {pluralize(stats.enrollmentCount, "total enrollment")} across every course, from{" "}
                {pluralize(stats.totalUsers, "registered user")}.
              </p>
            </Panel>
          </>
        )}
      </AsyncContent>
    </>
  );
}
