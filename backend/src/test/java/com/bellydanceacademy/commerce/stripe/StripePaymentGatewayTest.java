package com.bellydanceacademy.commerce.stripe;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.bellydanceacademy.commerce.stripe.PaymentGateway.CompletedCheckout;
import com.bellydanceacademy.commerce.stripe.PaymentGateway.PaymentRefunded;
import com.stripe.Stripe;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;

/** Parses real, signed Stripe webhook payloads — no network involved. */
class StripePaymentGatewayTest {

    private static final String SECRET = "whsec_test";

    private final StripePaymentGateway gateway = new StripePaymentGateway(new StripeProperties(null, SECRET));

    @Test
    void parsesAPaidCheckout() {
        String payload = event("checkout.session.completed", """
                {"id":"cs_1","object":"checkout.session","payment_status":"paid","payment_intent":"pi_1",
                 "amount_total":5900,"currency":"usd","metadata":{"courseId":"7"}}""");

        assertThat(gateway.parseWebhookEvent(payload, signature(payload)))
                .containsInstanceOf(CompletedCheckout.class)
                .get().isEqualTo(new CompletedCheckout("cs_1", "pi_1", 5900, "usd", Map.of("courseId", "7")));
    }

    @Test
    void ignoresAnUnpaidCheckout() {
        String payload = event("checkout.session.completed", """
                {"id":"cs_1","object":"checkout.session","payment_status":"unpaid"}""");

        assertThat(gateway.parseWebhookEvent(payload, signature(payload))).isEmpty();
    }

    @Test
    void parsesAFullRefund() {
        String payload = event("charge.refunded", """
                {"id":"ch_1","object":"charge","payment_intent":"pi_1","amount_refunded":5900,"refunded":true}""");

        assertThat(gateway.parseWebhookEvent(payload, signature(payload)))
                .contains(new PaymentRefunded("pi_1", 5900, true));
    }

    @Test
    void parsesAPartialRefund() {
        String payload = event("charge.refunded", """
                {"id":"ch_1","object":"charge","payment_intent":"pi_1","amount_refunded":1000,"refunded":false}""");

        assertThat(gateway.parseWebhookEvent(payload, signature(payload)))
                .contains(new PaymentRefunded("pi_1", 1000, false));
    }

    @Test
    void ignoresOtherEventTypes() {
        String payload = event("customer.created", """
                {"id":"cus_1","object":"customer"}""");

        assertThat(gateway.parseWebhookEvent(payload, signature(payload))).isEmpty();
    }

    @Test
    void rejectsABadSignature() {
        String payload = event("charge.refunded", "{\"id\":\"ch_1\",\"object\":\"charge\"}");

        assertThatThrownBy(() -> gateway.parseWebhookEvent(payload, "t=1,v1=forged"))
                .isInstanceOf(PaymentGateway.InvalidWebhookSignatureException.class);
    }

    private static String event(String type, String dataObject) {
        return """
                {"id":"evt_1","object":"event","api_version":"%s","type":"%s","data":{"object":%s}}"""
                .formatted(Stripe.API_VERSION, type, dataObject);
    }

    /** Stripe's scheme: HMAC-SHA256 of "timestamp.payload", sent as "t=…,v1=…". */
    private static String signature(String payload) {
        long timestamp = Instant.now().getEpochSecond();
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal((timestamp + "." + payload).getBytes(StandardCharsets.UTF_8));
            return "t=" + timestamp + ",v1=" + HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
