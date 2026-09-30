package com.bellydanceacademy.support;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.bellydanceacademy.commerce.stripe.PaymentGateway;
import com.bellydanceacademy.course.Course;
import com.bellydanceacademy.video.MuxClient;
import jakarta.servlet.http.Cookie;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/**
 * Base for API-level tests: full application context, real PostgreSQL,
 * real sessions and CSRF. External providers are mocked. Every test
 * creates its own uniquely-named data, so tests never depend on order.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({TestcontainersConfiguration.class, TestData.class})
public abstract class IntegrationTest {

    @Autowired
    protected MockMvc mvc;

    @Autowired
    protected TestData data;

    @MockitoBean
    protected PaymentGateway paymentGateway;

    @MockitoBean
    protected MuxClient muxClient;

    /** Signs in through the real endpoint and returns the session cookie. */
    protected Cookie login(String email, String password) throws Exception {
        Cookie session = mvc.perform(json(post("/api/auth/login"),
                        "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getCookie("bda_session");
        if (session == null) {
            throw new AssertionError("Login did not set a session cookie");
        }
        return session;
    }

    protected Cookie login(TestData.Account account) throws Exception {
        return login(account.email(), account.password());
    }

    /**
     * Simulates a paid checkout arriving through the payment webhook — the
     * only way an enrollment is ever created.
     *
     * @return the payment intent id, for refunding it later
     */
    protected String completePurchase(TestData.Account student, Course course, int commissionCents) throws Exception {
        String payload = "evt_" + TestData.unique();
        String paymentIntentId = "pi_" + payload;
        deliverWebhook(payload, new PaymentGateway.CompletedCheckout("cs_" + payload, paymentIntentId,
                course.getPriceCents(), "usd",
                Map.of("courseId", course.getId().toString(),
                        "studentId", student.id().toString(),
                        "commissionCents", Integer.toString(commissionCents))));
        return paymentIntentId;
    }

    /** Simulates a refund arriving through the payment webhook. */
    protected void refundPurchase(String paymentIntentId, long amountRefundedCents, boolean fullyRefunded)
            throws Exception {
        deliverWebhook("evt_" + TestData.unique(),
                new PaymentGateway.PaymentRefunded(paymentIntentId, amountRefundedCents, fullyRefunded));
    }

    protected void deliverWebhook(String payload, PaymentGateway.PaymentEvent event) throws Exception {
        when(paymentGateway.parseWebhookEvent(eq(payload), anyString())).thenReturn(Optional.of(event));
        mvc.perform(post("/api/webhooks/stripe").content(payload).header("Stripe-Signature", "t=1,v1=sig"))
                .andExpect(status().isOk());
    }

    /** A JSON request with a valid CSRF token, as the SPA sends it. */
    protected static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder request, String body) {
        return request.with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body);
    }
}
