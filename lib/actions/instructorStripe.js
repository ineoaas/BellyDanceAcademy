"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { setStripeAccountId } from "@/lib/users";
import { recordPayout } from "@/lib/payouts";
import stripe from "@/lib/stripe";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

/* Sends the instructor to Stripe's hosted onboarding (Express account,
   so we never handle identity/bank details ourselves). First call
   creates the account; later calls reuse it. */
export async function connectStripeAction() {
  const instructor = await requireUser("instructor");

  let accountId = instructor.stripe_account_id;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: instructor.email,
      capabilities: { transfers: { requested: true } },
    });
    accountId = account.id;
    setStripeAccountId(instructor.id, accountId);
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${APP_URL}/instructor?stripe=refresh`,
    return_url: `${APP_URL}/instructor?stripe=return`,
    type: "account_onboarding",
  });

  redirect(accountLink.url);
}

/* Moves the current available balance out early, ahead of Stripe's
   normal scheduled payout. */
export async function requestPayoutAction() {
  const instructor = await requireUser("instructor");

  if (!instructor.stripe_account_id || !instructor.stripe_payouts_enabled) {
    redirect("/instructor");
  }

  const balance = await stripe.balance.retrieve({
    stripeAccount: instructor.stripe_account_id,
  });
  const usdBalance = balance.available.find((entry) => entry.currency === "usd");
  const amountCents = usdBalance?.amount ?? 0;

  if (amountCents <= 0) {
    redirect("/instructor?payout=empty");
  }

  const payout = await stripe.payouts.create(
    { amount: amountCents, currency: "usd" },
    { stripeAccount: instructor.stripe_account_id }
  );

  recordPayout({
    instructorId: instructor.id,
    amountCents,
    stripePayoutId: payout.id,
    status: payout.status,
  });

  redirect("/instructor?payout=requested");
}
