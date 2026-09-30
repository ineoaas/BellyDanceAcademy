package com.bellydanceacademy.commerce;

import com.bellydanceacademy.commerce.stripe.PaymentGateway.CompletedCheckout;
import com.bellydanceacademy.course.Course;
import com.bellydanceacademy.course.CourseRepository;
import com.bellydanceacademy.learning.EnrollmentService;
import com.bellydanceacademy.user.User;
import com.bellydanceacademy.user.UserRepository;
import java.util.Locale;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Turns a paid checkout into a purchase + enrollment. The payment webhook
 * is the source of truth for "did this go through", never the browser
 * redirect back from checkout.
 */
@Service
class PurchaseService {

    private static final Logger log = LoggerFactory.getLogger(PurchaseService.class);

    private final PurchaseRepository purchases;
    private final CourseRepository courses;
    private final UserRepository users;
    private final EnrollmentService enrollments;
    private final ApplicationEventPublisher events;

    PurchaseService(PurchaseRepository purchases, CourseRepository courses, UserRepository users,
                    EnrollmentService enrollments, ApplicationEventPublisher events) {
        this.purchases = purchases;
        this.courses = courses;
        this.users = users;
        this.enrollments = enrollments;
        this.events = events;
    }

    /**
     * Idempotent: providers redeliver webhooks, so a checkout session that's
     * already recorded is a no-op. Purchase and enrollment commit together.
     *
     * @return the new purchase, or empty if nothing was recorded
     */
    @Transactional
    public Optional<Purchase> recordCompletedCheckout(CompletedCheckout checkout) {
        if (purchases.existsByStripeCheckoutSessionId(checkout.sessionId())) {
            return Optional.empty();
        }

        Long courseId = Long.valueOf(checkout.metadata().get(CheckoutService.META_COURSE_ID));
        Long studentId = Long.valueOf(checkout.metadata().get(CheckoutService.META_STUDENT_ID));
        int commissionCents = Integer.parseInt(checkout.metadata().get(CheckoutService.META_COMMISSION_CENTS));

        Optional<Course> course = courses.findById(courseId);
        Optional<User> student = users.findById(studentId);
        if (course.isEmpty() || student.isEmpty()) {
            log.error("Paid checkout {} references missing course {} or student {}", checkout.sessionId(), courseId, studentId);
            return Optional.empty();
        }

        int amountCents = Math.toIntExact(checkout.amountTotalCents());
        Commission split = new Commission(commissionCents, amountCents - commissionCents);
        Purchase purchase = purchases.save(new Purchase(studentId, courseId, amountCents, split,
                checkout.currency().toLowerCase(Locale.ROOT), checkout.sessionId(), checkout.paymentIntentId()));

        if (enrollments.isEnrolled(studentId, courseId)) {
            // Two checkouts for the same course both got paid. Keep the money
            // trail intact and flag it for a manual refund instead of failing
            // the webhook (which would just be retried forever).
            log.warn("Student {} paid twice for course {} (purchase {}); refund needed", studentId, courseId, purchase.getId());
        } else {
            enrollments.enroll(studentId, courseId, purchase.getId());
        }

        events.publishEvent(new PurchaseCompleted(purchase.getId(), student.get().getName(), student.get().getEmail(),
                course.get().getTitle(), amountCents, purchase.getCurrency()));
        return Optional.of(purchase);
    }
}
