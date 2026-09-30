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
     * Verifies a webhook's signature and extracts a paid checkout, if that's
     * what the event is.
     *
     * @throws InvalidWebhookSignatureException if the signature doesn't verify
     */
    Optional<CompletedCheckout> parseCompletedCheckout(String payload, String signatureHeader);

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

    record CompletedCheckout(String sessionId, String paymentIntentId, long amountTotalCents, String currency,
                             Map<String, String> metadata) {
    }

    class InvalidWebhookSignatureException extends RuntimeException {

        public InvalidWebhookSignatureException(Throwable cause) {
            super("Invalid webhook signature", cause);
        }
    }
}
