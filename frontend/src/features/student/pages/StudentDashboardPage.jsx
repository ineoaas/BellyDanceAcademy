import { Link, useSearchParams } from "react-router";
import { ActionButton, Alert, AsyncContent, Cell, PageHeader, Panel, Row, Table } from "@/components/ui";
import { useCurrentUser } from "@/features/auth/hooks";
import { firstName } from "@/lib/format";
import { useEnrollments } from "../hooks";

export default function StudentDashboardPage() {
  const user = useCurrentUser();
  const [params] = useSearchParams();
  const purchasedSlug = params.get("purchased");

  // Stripe redirects back before its webhook has necessarily reached us —
  // keep polling briefly until the new course shows up.
  const enrollments = useEnrollments({
    pollWhile: (list) => Boolean(purchasedSlug) && !list?.some((item) => item.courseSlug === purchasedSlug),
  });
  const purchaseArrived = enrollments.data?.some((item) => item.courseSlug === purchasedSlug);

  return (
    <>
      <PageHeader
        eyebrow="My Courses"
        title={`Welcome back, ${firstName(user.name)}`}
        actions={
          <ActionButton to="/courses" variant="solid">
            Browse More
          </ActionButton>
        }
      />

      {purchasedSlug && (
        <Alert tone={purchaseArrived ? "success" : "info"} className="mb-6 max-w-lg">
          {purchaseArrived
            ? "Payment received — your new course is ready below."
            : "Payment received — finishing setting up your course…"}
        </Alert>
      )}

      <Panel title="My Courses">
        <AsyncContent query={enrollments}>
          {(list) =>
            list.length === 0 ? (
              <p className="text-sm text-ink/55">
                You haven&apos;t bought a course yet.{" "}
                <Link to="/courses" className="underline">
                  Browse the catalog
                </Link>{" "}
                to get started.
              </p>
            ) : (
              <Table columns={["Course", "Instructor", "Progress", ""]}>
                {list.map((enrollment) => (
                  <Row key={enrollment.courseId}>
                    <Cell className="font-medium">
                      <Link to={`/courses/${enrollment.courseSlug}`}>{enrollment.courseTitle}</Link>
                    </Cell>
                    <Cell>{enrollment.instructorName}</Cell>
                    <Cell className="w-48">
                      <ProgressBar percent={enrollment.progressPercent} />
                    </Cell>
                    <Cell className="text-right">
                      {enrollment.resumeLessonId ? (
                        <ActionButton
                          to={`/courses/${enrollment.courseSlug}/watch/${enrollment.resumeLessonId}`}
                        >
                          {enrollment.started ? "Continue" : "Start Course"}
                        </ActionButton>
                      ) : (
                        <span className="text-xs text-ink/40">No lessons yet</span>
                      )}
                    </Cell>
                  </Row>
                ))}
              </Table>
            )
          }
        </AsyncContent>
      </Panel>
    </>
  );
}

function ProgressBar({ percent }) {
  return (
    <div>
      <span className="text-xs text-ink/55">{percent}%</span>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-1.5 h-1 bg-burgundy/10"
      >
        <div className="h-full bg-gold" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
