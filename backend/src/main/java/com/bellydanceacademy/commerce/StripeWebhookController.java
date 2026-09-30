package com.bellydanceacademy.commerce;

import com.bellydanceacademy.commerce.stripe.PaymentGateway;
import com.bellydanceacademy.common.error.ProblemDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/webhooks/stripe")
class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    private final PaymentGateway paymentGateway;
    private final PurchaseService purchaseService;

    StripeWebhookController(PaymentGateway paymentGateway, PurchaseService purchaseService) {
        this.paymentGateway = paymentGateway;
        this.purchaseService = purchaseService;
    }

    @PostMapping
    ResponseEntity<?> receive(@RequestBody String payload,
                              @RequestHeader(name = "Stripe-Signature", required = false) String signature) {
        try {
            paymentGateway.parseCompletedCheckout(payload, signature).ifPresent(purchaseService::recordCompletedCheckout);
        } catch (PaymentGateway.InvalidWebhookSignatureException e) {
            return ResponseEntity.badRequest().body(ProblemDetails.of(HttpStatus.BAD_REQUEST, "INVALID_SIGNATURE",
                    "Invalid webhook signature."));
        } catch (DataIntegrityViolationException e) {
            // A concurrent redelivery of the same event won the race; it's recorded.
            log.info("Duplicate Stripe checkout delivery ignored");
        }
        return ResponseEntity.ok().build();
    }
}
