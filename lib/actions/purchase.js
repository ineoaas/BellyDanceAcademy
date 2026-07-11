"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, DASHBOARD_BY_ROLE } from "@/lib/auth";
import { findCourseBySlug } from "@/lib/courses";
import { hasPurchased } from "@/lib/purchases";
import { getCommissionRatePercent } from "@/lib/settings";
import stripe from "@/lib/stripe";

/* Starts checkout for a single course — no multi-course cart; Stripe's
   hosted Checkout page is the whole checkout flow. */
export async function purchaseCourseAction(formData) {
  const slug = formData.get("slug")?.toString() ?? "";
  const course = findCourseBySlug(slug);
  if (!course || course.status !== "live") {
    redirect("/courses");
  }

  /* Re-check auth server-side — the Buy Now button's visibility is a
     UX nicety, not authorization. */
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?as=student&redirect=/courses/${slug}`);
  }
  if (user.role !== "student") {
    redirect(DASHBOARD_BY_ROLE[user.role] ?? "/");
  }

  if (hasPurchased(user.id, course.id)) {
    redirect("/student");
  }

  /* No payout destination until the instructor finishes Stripe Connect. */
  if (!course.instructor_stripe_account_id || !course.instructor_payouts_enabled) {
    redirect(`/courses/${slug}?error=unavailable`);
  }

  const commissionCents = Math.round(
    (course.price_cents * getCommissionRatePercent()) / 100
  );
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: course.price_cents,
          product_data: { name: course.title },
        },
      },
    ],
    payment_intent_data: {
      /* Platform keeps commissionCents; Stripe auto-transfers the rest
         to the instructor the moment the charge succeeds. */
      application_fee_amount: commissionCents,
      transfer_data: { destination: course.instructor_stripe_account_id },
    },
    /* Recorded in metadata so the webhook uses the split quoted at
       checkout, not whatever the commission rate is by then. */
    metadata: {
      courseId: String(course.id),
      studentId: String(user.id),
      commissionCents: String(commissionCents),
    },
    success_url: `${appUrl}/student?purchased=${course.slug}`,
    cancel_url: `${appUrl}/courses/${course.slug}?checkout=cancelled`,
  });

  redirect(session.url);
}
