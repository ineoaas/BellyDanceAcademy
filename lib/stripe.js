const Stripe = require("stripe");

/*
 * Shared client (same idea as the single `db` connection in lib/db.js).
 * Falls back to a placeholder key so a missing STRIPE_SECRET_KEY fails
 * as a catchable rejected promise on actual use, not a startup crash
 * for every page that merely imports this file.
 */
module.exports = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_not_configured");
