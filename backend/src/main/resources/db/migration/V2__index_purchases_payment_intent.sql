-- Refund webhooks identify the purchase by its payment intent.
CREATE UNIQUE INDEX ux_purchases_payment_intent ON purchases (stripe_payment_intent_id);
