import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { findCourseById } from "@/lib/courses";
import { findUserById } from "@/lib/users";
import { recordPurchase } from "@/lib/purchases";
import { sendPurchaseConfirmationEmail } from "@/lib/email";

/*
 * Stripe calls this directly over HTTP (plain Route Handler, not a
 * Server Action) — the source of truth for "did this payment go
 * through," not the browser redirect back from Checkout.
 */
export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid") {
      await handleCheckoutCompleted(session);
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session) {
  const courseId = Number(session.metadata.courseId);
  const studentId = Number(session.metadata.studentId);
  const commissionCents = Number(session.metadata.commissionCents);

  const course = findCourseById(courseId);
  const student = findUserById(studentId);
  if (!course || !student) return;

  const amountCents = session.amount_total;

  const { isNew } = recordPurchase({
    studentId,
    courseId,
    amountCents,
    commissionCents,
    instructorEarningsCents: amountCents - commissionCents,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: session.payment_intent,
  });

  /* Don't resend a receipt for a duplicate webhook delivery. */
  if (!isNew) return;

  try {
    await sendPurchaseConfirmationEmail(student, course, amountCents);
  } catch (err) {
    console.error("Failed to send purchase confirmation email", err);
  }
}
