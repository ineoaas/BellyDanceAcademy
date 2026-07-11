import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { setStripePayoutsEnabled } from "@/lib/users";
import { listCourseStatsForInstructor } from "@/lib/purchases";
import { listPayoutsForInstructor } from "@/lib/payouts";
import { connectStripeAction, requestPayoutAction } from "@/lib/actions/instructorStripe";
import stripe from "@/lib/stripe";

export default async function InstructorDashboard({ searchParams }) {
  /* requireUser redirects away non-instructors, so past this line we're
     always a logged-in instructor. */
  const instructor = await requireUser("instructor");
  const search = await searchParams;
  const firstName = instructor.name.split(" ")[0];

  const { payoutsEnabled, availableCents } = await refreshStripeStatus(instructor);

  const courseStats = listCourseStatsForInstructor(instructor.id);
  const payouts = listPayoutsForInstructor(instructor.id);

  const totalRevenueCents = courseStats.reduce((sum, course) => sum + course.revenue_cents, 0);
  const totalStudents = courseStats.reduce((sum, course) => sum + course.student_count, 0);
  const activeCourses = courseStats.filter((course) => course.status === "live").length;

  return (
    <main className="grid md:grid-cols-[220px_1fr] flex-1">
      <aside className="bg-burgundy-dark text-gold-pale/80 p-6">
        <div className="flex gap-3 items-center pb-4 mb-4 border-b border-gold/25">
          <div className="medallion w-11 h-11 bg-burgundy-deep border border-gold font-display text-gold-light">
            {firstName[0]}
          </div>
          <div>
            <strong className="block text-ivory text-sm font-display">{instructor.name}</strong>
            <span className="text-[0.65rem] uppercase tracking-widest">Instructor</span>
          </div>
        </div>
        <nav className="space-y-1 text-sm">
          <SideLink href="#" active>Overview</SideLink>
          <SideLink href="#">My Courses</SideLink>
          <SideLink href="#">Upload New Course</SideLink>
          <SideLink href="#">Payouts</SideLink>
        </nav>
      </aside>

      <div className="p-8 bg-cream">
        <div className="flex justify-between items-start flex-wrap gap-4 mb-7">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase text-burgundy font-medium">Overview</span>
            <h1 className="font-display text-2xl mt-1">Welcome back, {firstName}</h1>
          </div>
        </div>

        {!instructor.stripe_account_id && (
          <div className="bg-ivory border border-gold/30 p-6 mb-6">
            <h3 className="font-display text-lg mb-2">Connect with Stripe</h3>
            <p className="text-sm text-ink/60 mb-4">
              Payouts for your courses run through Stripe. Connect an account to start selling and
              get paid — course revenue and payout history will show up here once you do.
            </p>
            <form action={connectStripeAction}>
              <button
                type="submit"
                className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-5 py-3"
              >
                Connect with Stripe
              </button>
            </form>
          </div>
        )}

        {instructor.stripe_account_id && !payoutsEnabled && (
          <div className="bg-ivory border border-gold/30 p-6 mb-6">
            <h3 className="font-display text-lg mb-2">Finish Setting Up Stripe</h3>
            <p className="text-sm text-ink/60 mb-4">
              Your Stripe account was started but isn&apos;t finished yet — a few more details are
              needed before you can be paid.
            </p>
            <form action={connectStripeAction}>
              <button
                type="submit"
                className="text-xs uppercase tracking-widest bg-burgundy-deep text-gold-pale px-5 py-3"
              >
                Finish Stripe Setup
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat label="Total Revenue" value={formatDollars(totalRevenueCents)} />
          <Stat label="Students Enrolled" value={totalStudents} />
          <Stat label="Active Courses" value={activeCourses} />
          <Stat
            label="Available for Payout"
            value={availableCents === null ? "—" : formatDollars(availableCents)}
          />
        </div>

        <div className="bg-ivory border border-gold/30 p-6 mb-6">
          <h3 className="font-display text-lg mb-4">My Courses</h3>
          {courseStats.length === 0 ? (
            <p className="text-sm text-ink/55">No courses yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-widest text-ink/55 border-b border-gold/30">
                  <th className="py-2">Course</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Students</th>
                  <th className="py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {courseStats.map((course) => (
                  <tr key={course.id} className="border-b border-dotted border-gold/30 last:border-none">
                    <td className="py-3 font-medium">
                      <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                    </td>
                    <td className="py-3">
                      <span
                        className={
                          "inline-block px-2.5 py-1 text-[0.6rem] uppercase font-semibold " +
                          getCourseStatusClasses(course.status)
                        }
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="py-3">{course.student_count}</td>
                    <td className="py-3">{formatDollars(course.revenue_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-ivory border border-gold/30 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-lg">Payout History</h3>
            {payoutsEnabled && (
              <form action={requestPayoutAction}>
                <button type="submit" className="text-xs uppercase tracking-widest border border-gold px-4 py-2">
                  Request Payout
                </button>
              </form>
            )}
          </div>

          {search?.payout === "empty" && (
            <p className="text-xs text-ink/50 mb-3">Nothing available to pay out right now.</p>
          )}
          {search?.payout === "requested" && (
            <p className="text-xs text-ink/50 mb-3">Payout requested — Stripe is processing it now.</p>
          )}

          {payouts.length === 0 ? (
            <p className="text-sm text-ink/55">No payouts yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-widest text-ink/55 border-b border-gold/30">
                  <th className="py-2">Date</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-dotted border-gold/30 last:border-none">
                    <td className="py-3">{formatDate(payout.requested_at)}</td>
                    <td className="py-3">{formatDollars(payout.amount_cents)}</td>
                    <td className="py-3">
                      <span className="inline-block px-2.5 py-1 text-[0.6rem] uppercase font-semibold bg-emerald-800/10 text-emerald-800">
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}

/*
 * Stripe is the source of truth for payout status, so this polls it
 * once per dashboard load and refreshes the cached column — simpler
 * than an `account.updated` webhook at this app's scale.
 */
async function refreshStripeStatus(instructor) {
  if (!instructor.stripe_account_id) {
    return { payoutsEnabled: false, availableCents: null };
  }

  try {
    const account = await stripe.accounts.retrieve(instructor.stripe_account_id);
    const payoutsEnabled = Boolean(account.payouts_enabled);
    if (payoutsEnabled !== Boolean(instructor.stripe_payouts_enabled)) {
      setStripePayoutsEnabled(instructor.id, payoutsEnabled);
    }

    let availableCents = null;
    if (payoutsEnabled) {
      const balance = await stripe.balance.retrieve({ stripeAccount: instructor.stripe_account_id });
      const usdBalance = balance.available.find((entry) => entry.currency === "usd");
      availableCents = usdBalance?.amount ?? 0;
    }

    return { payoutsEnabled, availableCents };
  } catch (err) {
    /* Stripe unreachable — fall back to the last cached value. */
    console.error("Could not refresh Stripe account status", err);
    return { payoutsEnabled: Boolean(instructor.stripe_payouts_enabled), availableCents: null };
  }
}

function formatDollars(cents) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(sqliteDatetime) {
  /* SQLite's datetime('now') has no timezone marker; force UTC parsing. */
  const date = new Date(sqliteDatetime.replace(" ", "T") + "Z");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getCourseStatusClasses(status) {
  if (status === "live") {
    return "bg-burgundy/10 text-burgundy";
  }
  return "bg-gold/20 text-[#7A5D1D]";
}

function Stat({ label, value, delta }) {
  return (
    <div className="bg-ivory border border-gold/30 border-t-2 border-t-gold p-4">
      <span className="text-[0.62rem] uppercase tracking-widest text-ink/55">{label}</span>
      <strong className="block font-display text-2xl text-burgundy mt-1">{value}</strong>
      {delta && <small className="text-gold font-medium">{delta}</small>}
    </div>
  );
}

function SideLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 border-l-2 ${
        active ? "border-gold-light text-gold-light" : "border-transparent hover:text-ivory"
      }`}
    >
      {children}
    </Link>
  );
}
