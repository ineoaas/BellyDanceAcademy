package com.bellydanceacademy.commerce.stripe;

import java.util.Map;
import java.util.Optional;

/**
 * Everything the marketplace needs from its payment provider. Keeping
 * Stripe's SDK behind this interface keeps it out of the domain services
 * and lets tests substitute a fake.
 */
public interface PaymentGateway {

    /** Starts a hosted checkout that splits the payment with the instructor. Returns the redirect URL. */
    String createCheckout(CheckoutRequest request);

    /** Creates an Express connected account for an instructor. Returns its id. */
    String createConnectedAccount(String email);

    /** A one-time link into the provider's hosted onboarding for a connected account. */
    String createOnboardingLink(String accountId, String refreshUrl, String returnUrl);

    boolean payoutsEnabled(String accountId);

    long availableBalanceCents(String accountId, String currency);

    PayoutResult createPayout(String accountId, long amountCents, String currency);

    /**
     * Verifies a webhook's signature and extracts the event, if it's one the
     * marketplace acts on.
     *
     * @throws InvalidWebhookSignatureException if the signature doesn't verify
     */
    Optional<PaymentEvent> parseWebhookEvent(String payload, String signatureHeader);

    record CheckoutRequest(
            String productName,
            int amountCents,
            String currency,
            String customerEmail,
            int applicationFeeCents,
            String destinationAccountId,
            Map<String, String> metadata,
            String successUrl,
            String cancelUrl) {
    }

    record PayoutResult(String id, String status) {
    }

    /** A provider event the marketplace reacts to. */
    sealed interface PaymentEvent permits CompletedCheckout, PaymentRefunded {
    }

    /** A checkout session that has been paid. */
    record CompletedCheckout(String sessionId, String paymentIntentId, long amountTotalCents, String currency,
                             Map<String, String> metadata) implements PaymentEvent {
    }

    /**
     * Money was returned on a payment.
     *
     * @param fullyRefunded false for a partial refund, which leaves the purchase in place
     */
    record PaymentRefunded(String paymentIntentId, long amountRefundedCents, boolean fullyRefunded)
            implements PaymentEvent {
    }

    class InvalidWebhookSignatureException extends RuntimeException {

        public InvalidWebhookSignatureException(Throwable cause) {
            super("Invalid webhook signature", cause);
        }
    }
}
