package com.bellydanceacademy.commerce.stripe;

import com.bellydanceacademy.common.error.ExternalServiceException;
import com.stripe.StripeClient;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.Balance;
import com.stripe.model.Charge;
import com.stripe.model.Event;
import com.stripe.model.Payout;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.RequestOptions;
import com.stripe.net.Webhook;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.AccountLinkCreateParams;
import com.stripe.param.PayoutCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
class StripePaymentGateway implements PaymentGateway {

    private static final String SERVICE_NAME = "Payments";
    private static final String CHECKOUT_COMPLETED = "checkout.session.completed";
    private static final String CHARGE_REFUNDED = "charge.refunded";

    private final StripeProperties properties;
    private volatile StripeClient client;

    StripePaymentGateway(StripeProperties properties) {
        this.properties = properties;
    }

    @Override
    public String createCheckout(CheckoutRequest request) {
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setCustomerEmail(request.customerEmail())
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(request.currency())
                                .setUnitAmount((long) request.amountCents())
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName(request.productName())
                                        .build())
                                .build())
                        .build())
                // Platform keeps the fee; Stripe transfers the rest to the instructor on success.
                .setPaymentIntentData(SessionCreateParams.PaymentIntentData.builder()
                        .setApplicationFeeAmount((long) request.applicationFeeCents())
                        .setTransferData(SessionCreateParams.PaymentIntentData.TransferData.builder()
                                .setDestination(request.destinationAccountId())
                                .build())
                        .build())
                .putAllMetadata(request.metadata())
                .setSuccessUrl(request.successUrl())
                .setCancelUrl(request.cancelUrl())
                .build();
        return call(() -> client().v1().checkout().sessions().create(params).getUrl());
    }

    @Override
    public String createConnectedAccount(String email) {
        AccountCreateParams params = AccountCreateParams.builder()
                .setType(AccountCreateParams.Type.EXPRESS)
                .setEmail(email)
                .setCapabilities(AccountCreateParams.Capabilities.builder()
                        .setTransfers(AccountCreateParams.Capabilities.Transfers.builder().setRequested(true).build())
                        .build())
                .build();
        return call(() -> client().v1().accounts().create(params).getId());
    }

    @Override
    public String createOnboardingLink(String accountId, String refreshUrl, String returnUrl) {
        AccountLinkCreateParams params = AccountLinkCreateParams.builder()
                .setAccount(accountId)
                .setRefreshUrl(refreshUrl)
                .setReturnUrl(returnUrl)
                .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                .build();
        return call(() -> client().v1().accountLinks().create(params).getUrl());
    }

    @Override
    public boolean payoutsEnabled(String accountId) {
        Account account = call(() -> client().v1().accounts().retrieve(accountId));
        return Boolean.TRUE.equals(account.getPayoutsEnabled());
    }

    @Override
    public long availableBalanceCents(String accountId, String currency) {
        Balance balance = call(() -> client().v1().balance().retrieve(onBehalfOf(accountId)));
        return balance.getAvailable().stream()
                .filter(entry -> currency.equalsIgnoreCase(entry.getCurrency()))
                .mapToLong(Balance.Available::getAmount)
                .sum();
    }

    @Override
    public PayoutResult createPayout(String accountId, long amountCents, String currency) {
        PayoutCreateParams params = PayoutCreateParams.builder().setAmount(amountCents).setCurrency(currency).build();
        Payout payout = call(() -> client().v1().payouts().create(params, onBehalfOf(accountId)));
        return new PayoutResult(payout.getId(), payout.getStatus());
    }

    @Override
    public Optional<PaymentEvent> parseWebhookEvent(String payload, String signatureHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, signatureHeader, properties.webhookSecret());
        } catch (SignatureVerificationException | IllegalArgumentException | NullPointerException e) {
            throw new InvalidWebhookSignatureException(e);
        }
        return switch (event.getType()) {
            case CHECKOUT_COMPLETED -> toCompletedCheckout(dataObject(event));
            case CHARGE_REFUNDED -> toPaymentRefunded(dataObject(event));
            default -> Optional.empty();
        };
    }

    private static Optional<PaymentEvent> toCompletedCheckout(StripeObject object) {
        if (!(object instanceof Session session) || !"paid".equals(session.getPaymentStatus())) {
            return Optional.empty();
        }
        return Optional.of(new CompletedCheckout(session.getId(), session.getPaymentIntent(),
                session.getAmountTotal(), session.getCurrency(), session.getMetadata()));
    }

    private static Optional<PaymentEvent> toPaymentRefunded(StripeObject object) {
        if (!(object instanceof Charge charge) || charge.getPaymentIntent() == null) {
            return Optional.empty();
        }
        return Optional.of(new PaymentRefunded(charge.getPaymentIntent(), charge.getAmountRefunded(),
                Boolean.TRUE.equals(charge.getRefunded())));
    }

    private static StripeObject dataObject(Event event) {
        return event.getDataObjectDeserializer().getObject().orElseGet(() -> deserializeUnsafe(event));
    }

    /** Falls back when the event's API version differs from the SDK's pinned one. */
    private static StripeObject deserializeUnsafe(Event event) {
        try {
            return event.getDataObjectDeserializer().deserializeUnsafe();
        } catch (Exception e) {
            throw new IllegalStateException("Could not read Stripe event " + event.getId(), e);
        }
    }

    private static RequestOptions onBehalfOf(String accountId) {
        return RequestOptions.builder().setStripeAccount(accountId).build();
    }

    private StripeClient client() {
        if (client == null) {
            synchronized (this) {
                if (client == null) {
                    if (!properties.configured()) {
                        throw new ExternalServiceException(SERVICE_NAME,
                                new IllegalStateException("STRIPE_SECRET_KEY is not configured"));
                    }
                    client = new StripeClient(properties.secretKey());
                }
            }
        }
        return client;
    }

    private static <T> T call(StripeCall<T> call) {
        try {
            return call.execute();
        } catch (StripeException e) {
            throw new ExternalServiceException(SERVICE_NAME, e);
        }
    }

    @FunctionalInterface
    private interface StripeCall<T> {
        T execute() throws StripeException;
    }
}
