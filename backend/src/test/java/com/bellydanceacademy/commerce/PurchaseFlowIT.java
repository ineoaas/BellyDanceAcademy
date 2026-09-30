package com.bellydanceacademy.commerce;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.bellydanceacademy.commerce.stripe.PaymentGateway;
import com.bellydanceacademy.course.Course;
import com.bellydanceacademy.lesson.Lesson;
import com.bellydanceacademy.support.IntegrationTest;
import com.bellydanceacademy.support.TestData;
import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.http.Cookie;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;

class PurchaseFlowIT extends IntegrationTest {

    @Autowired
    PurchaseRepository purchases;

    @Test
    void checkoutQuotesTheCurrentCommissionSplit() throws Exception {
        Course course = data.liveCourse(data.payableInstructor(), 5900);
        when(paymentGateway.createCheckout(any())).thenReturn("https://checkout.test/session");

        mvc.perform(post("/api/courses/{slug}/checkout", course.getSlug()).with(csrf()).cookie(login(data.student())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.checkoutUrl").value("https://checkout.test/session"));

        ArgumentCaptor<PaymentGateway.CheckoutRequest> request = ArgumentCaptor.forClass(PaymentGateway.CheckoutRequest.class);
        verify(paymentGateway).createCheckout(request.capture());
        assertThat(request.getValue().amountCents()).isEqualTo(5900);
        assertThat(request.getValue().applicationFeeCents()).isEqualTo(1180);
        assertThat(request.getValue().metadata()).containsEntry("commissionCents", "1180");
    }

    @Test
    void coursesWithoutPayoutSetupCannotBeBought() throws Exception {
        Course course = data.liveCourse(data.instructor(), 5900);

        mvc.perform(post("/api/courses/{slug}/checkout", course.getSlug()).with(csrf()).cookie(login(data.student())))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("COURSE_UNAVAILABLE"));
    }

    @Test
    void paidWebhookGrantsAccessExactlyOnce() throws Exception {
        TestData.Account student = data.student();
        Course course = data.liveCourse(data.payableInstructor(), 5900);
        List<Lesson> lessons = data.lessons(course, 2);
        Cookie session = login(student);

        mvc.perform(get("/api/courses/{slug}/lessons/{id}/watch", course.getSlug(), lessons.get(1).getId()).cookie(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("LESSON_LOCKED"));

        completePurchase(student, course, 1180);
        completePurchase(student, course, 1180); // a second, distinct paid session is recorded but not re-enrolled

        mvc.perform(get("/api/me/enrollments").cookie(session))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].courseSlug").value(course.getSlug()))
                .andExpect(jsonPath("$[0].resumeLessonId").value(lessons.get(0).getId()))
                .andExpect(jsonPath("$[0].started").value(false));
        mvc.perform(get("/api/courses/{slug}/lessons/{id}/watch", course.getSlug(), lessons.get(1).getId()).cookie(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lesson.trackProgress").value(true));
        mvc.perform(post("/api/courses/{slug}/checkout", course.getSlug()).with(csrf()).cookie(session))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("ALREADY_ENROLLED"));
    }

    @Test
    void redeliveredWebhookIsIdempotent() throws Exception {
        TestData.Account student = data.student();
        Course course = data.liveCourse(data.payableInstructor(), 5900);
        String payload = "evt_" + TestData.unique();
        when(paymentGateway.parseCompletedCheckout(eq(payload), anyString()))
                .thenReturn(Optional.of(new PaymentGateway.CompletedCheckout("cs_" + payload, "pi", 5900, "usd",
                        Map.of("courseId", course.getId().toString(), "studentId", student.id().toString(),
                                "commissionCents", "1180"))));

        long before = purchases.count();
        for (int delivery = 0; delivery < 3; delivery++) {
            mvc.perform(post("/api/webhooks/stripe").content(payload).header("Stripe-Signature", "sig"))
                    .andExpect(status().isOk());
        }
        assertThat(purchases.count()).isEqualTo(before + 1);
    }

    @Test
    void invalidWebhookSignatureIsRejected() throws Exception {
        when(paymentGateway.parseCompletedCheckout(anyString(), any()))
                .thenThrow(new PaymentGateway.InvalidWebhookSignatureException(new RuntimeException()));

        mvc.perform(post("/api/webhooks/stripe").content("{}").header("Stripe-Signature", "forged"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_SIGNATURE"));
    }

    @Test
    void progressTracksCompletionAcrossTheCourse() throws Exception {
        TestData.Account student = data.student();
        Course course = data.liveCourse(data.payableInstructor(), 5900);
        List<Lesson> lessons = data.lessons(course, 2);
        completePurchase(student, course, 1180);
        Cookie session = login(student);

        mvc.perform(json(put("/api/me/lessons/{id}/progress", lessons.get(0).getId()), "{\"positionSeconds\":95}").cookie(session))
                .andExpect(jsonPath("$.courseProgressPercent").value(50));
        // Rewinding never un-completes a lesson.
        mvc.perform(json(put("/api/me/lessons/{id}/progress", lessons.get(0).getId()), "{\"positionSeconds\":5}").cookie(session))
                .andExpect(jsonPath("$.courseProgressPercent").value(50));

        mvc.perform(get("/api/me/enrollments").cookie(session))
                .andExpect(jsonPath("$[0].progressPercent").value(50))
                .andExpect(jsonPath("$[0].resumeLessonId").value(lessons.get(0).getId()))
                .andExpect(jsonPath("$[0].started").value(true));
    }

    @Test
    void onlyPurchasersReviewAndHiddenReviewsStayHidden() throws Exception {
        TestData.Account student = data.student();
        Course course = data.liveCourse(data.payableInstructor(), 5900);
        Cookie session = login(student);
        String review = "{\"rating\":4,\"comment\":\"Lovely\"}";

        mvc.perform(json(put("/api/courses/{slug}/reviews/mine", course.getSlug()), review).cookie(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("NOT_A_PURCHASER"));

        completePurchase(student, course, 1180);
        mvc.perform(json(put("/api/courses/{slug}/reviews/mine", course.getSlug()), review).cookie(session))
                .andExpect(status().isOk());
        mvc.perform(get("/api/courses/{slug}", course.getSlug()))
                .andExpect(jsonPath("$.course.averageRating").value(4.0))
                .andExpect(jsonPath("$.course.reviewCount").value(1));

        Cookie admin = login(data.admin());
        String reviewId = JsonPath.read(
                mvc.perform(get("/api/courses/{slug}/reviews", course.getSlug())).andReturn().getResponse().getContentAsString(),
                "$[0].id").toString();
        mvc.perform(json(put("/api/admin/reviews/{id}/status", reviewId), "{\"status\":\"HIDDEN\"}").cookie(admin))
                .andExpect(status().isNoContent());

        // Editing a hidden review must not sneak it back into public view.
        mvc.perform(json(put("/api/courses/{slug}/reviews/mine", course.getSlug()), "{\"rating\":5,\"comment\":\"Edited\"}").cookie(session))
                .andExpect(status().isOk());
        mvc.perform(get("/api/courses/{slug}/reviews", course.getSlug()))
                .andExpect(jsonPath("$.length()").value(0));
    }
}
