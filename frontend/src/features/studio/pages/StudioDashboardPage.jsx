import { Link, useSearchParams } from "react-router";
import {
  ActionButton,
  ActionsCell,
  Alert,
  AsyncContent,
  Cell,
  ErrorAlert,
  PageHeader,
  Panel,
  Row,
  StatTile,
  StatusBadge,
  Table,
} from "@/components/ui";
import { useCurrentUser } from "@/features/auth/hooks";
import { firstName, formatDate, formatMoney } from "@/lib/format";
import { useRequestPayout, useStripeOnboarding, useStudioDashboard } from "../hooks";

export default function StudioDashboardPage() {
  const user = useCurrentUser();
  const dashboard = useStudioDashboard();

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${firstName(user.name)}`}
        actions={
          <ActionButton to="/instructor/courses/new" variant="solid">
            New Course
          </ActionButton>
        }
      />
      <AsyncContent query={dashboard}>
        {(data) => (
          <>
            <StripeSetup stripe={data.stripe} />
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatTile label="Total Revenue" value={formatMoney(data.totals.revenueCents)} />
              <StatTile label="Students Enrolled" value={data.totals.studentCount} />
              <StatTile label="Live Courses" value={data.totals.liveCourseCount} />
              <StatTile
                label="Available for Payout"
                value={data.stripe.availableCents == null ? "—" : formatMoney(data.stripe.availableCents)}
              />
            </div>
            <CoursesPanel courses={data.courses} />
            <PayoutsPanel payouts={data.payouts} payoutsEnabled={data.stripe.payoutsEnabled} />
          </>
        )}
      </AsyncContent>
    </>
  );
}

function StripeSetup({ stripe }) {
  const onboarding = useStripeOnboarding();
  const [params] = useSearchParams();
  if (stripe.payoutsEnabled) return null;

  const started = stripe.connected;
  return (
    <Panel title={started ? "Finish Setting Up Stripe" : "Connect with Stripe"} className="mb-6">
      {params.get("stripe") === "return" && (
        <Alert tone="info" className="mb-4">
          Stripe is still verifying your details — this page updates once they&apos;re done.
        </Alert>
      )}
      <p className="mb-4 text-sm text-ink/60">
        {started
          ? "Your Stripe account was started but isn't finished yet — a few more details are needed before you can be paid."
          : "Payouts for your courses run through Stripe. Connect an account to start selling and get paid — course revenue and payout history will show up here once you do."}
      </p>
      <ErrorAlert error={onboarding.error} className="mb-4" />
      <ActionButton
        variant="solid"
        className="px-5 py-3"
        disabled={onboarding.isPending}
        onClick={() => onboarding.mutate()}
      >
        {started ? "Finish Stripe Setup" : "Connect with Stripe"}
      </ActionButton>
    </Panel>
  );
}

function CoursesPanel({ courses }) {
  return (
    <Panel title="My Courses" className="mb-6">
      {courses.length === 0 ? (
        <p className="text-sm text-ink/55">
          No courses yet.{" "}
          <Link to="/instructor/courses/new" className="underline">
            Create your first one
          </Link>
          .
        </p>
      ) : (
        <Table columns={["Course", "Status", "Students", "Revenue", ""]}>
          {courses.map((course) => (
            <Row key={course.courseId}>
              <Cell className="font-medium">
                {course.status === "LIVE" ? (
                  <Link to={`/courses/${course.slug}`}>{course.title}</Link>
                ) : (
                  course.title
                )}
              </Cell>
              <Cell>
                <StatusBadge status={course.status} />
              </Cell>
              <Cell>{course.studentCount}</Cell>
              <Cell>{formatMoney(course.revenueCents)}</Cell>
              <ActionsCell>
                <ActionButton to={`/instructor/courses/${course.courseId}`}>Manage Lessons</ActionButton>
              </ActionsCell>
            </Row>
          ))}
        </Table>
      )}
    </Panel>
  );
}

function PayoutsPanel({ payouts, payoutsEnabled }) {
  const requestPayout = useRequestPayout();

  return (
    <Panel
      title="Payout History"
      action={
        payoutsEnabled && (
          <ActionButton disabled={requestPayout.isPending} onClick={() => requestPayout.mutate()}>
            Request Payout
          </ActionButton>
        )
      }
    >
      {requestPayout.isSuccess && (
        <Alert tone="success" className="mb-3">
          Payout requested — Stripe is processing it now.
        </Alert>
      )}
      <ErrorAlert error={requestPayout.error} className="mb-3" />
      {payouts.length === 0 ? (
        <p className="text-sm text-ink/55">No payouts yet.</p>
      ) : (
        <Table columns={["Date", "Amount", "Status"]}>
          {payouts.map((payout) => (
            <Row key={payout.id}>
              <Cell>{formatDate(payout.requestedAt)}</Cell>
              <Cell>{formatMoney(payout.amountCents)}</Cell>
              <Cell>
                <StatusBadge status={payout.status} />
              </Cell>
            </Row>
          ))}
        </Table>
      )}
    </Panel>
  );
}
