package com.bellydanceacademy.commerce;

import com.bellydanceacademy.commerce.stripe.PaymentGateway;
import com.bellydanceacademy.common.error.BusinessRuleException;
import com.bellydanceacademy.common.error.ConflictException;
import com.bellydanceacademy.common.error.NotFoundException;
import com.bellydanceacademy.config.AppProperties;
import com.bellydanceacademy.course.Course;
import com.bellydanceacademy.course.CourseQueryService;
import com.bellydanceacademy.learning.EnrollmentService;
import com.bellydanceacademy.user.AuthenticatedUser;
import com.bellydanceacademy.user.User;
import com.bellydanceacademy.user.UserRepository;
import java.util.Map;
import org.springframework.stereotype.Service;

/** Single-course checkout through the provider's hosted page — there's no cart. */
@Service
public class CheckoutService {

    static final String META_COURSE_ID = "courseId";
    static final String META_STUDENT_ID = "studentId";
    static final String META_COMMISSION_CENTS = "commissionCents";

    private final CourseQueryService courseQueries;
    private final EnrollmentService enrollments;
    private final UserRepository users;
    private final CommissionService commissionService;
    private final PaymentGateway paymentGateway;
    private final AppProperties appProperties;

    CheckoutService(CourseQueryService courseQueries, EnrollmentService enrollments, UserRepository users,
                    CommissionService commissionService, PaymentGateway paymentGateway, AppProperties appProperties) {
        this.courseQueries = courseQueries;
        this.enrollments = enrollments;
        this.users = users;
        this.commissionService = commissionService;
        this.paymentGateway = paymentGateway;
        this.appProperties = appProperties;
    }

    /**
     * Deliberately not transactional: it only reads, then calls the payment
     * provider — no DB connection is held open across that network call.
     *
     * @return the hosted checkout URL to redirect the student to
     */
    public String startCheckout(AuthenticatedUser student, String courseSlug) {
        Course course = courseQueries.getLiveBySlug(courseSlug);
        if (enrollments.isEnrolled(student.id(), course.getId())) {
            throw new ConflictException("ALREADY_ENROLLED", "You already own this course.");
        }

        User instructor = users.findById(course.getInstructorId()).orElseThrow(() -> new NotFoundException("Instructor"));
        if (!instructor.canReceivePayouts()) {
            throw new BusinessRuleException("COURSE_UNAVAILABLE",
                    "This course isn't available for purchase yet — the instructor is still setting up payouts.");
        }

        // The split is quoted now and carried in metadata, so the webhook
        // records what the student was actually charged under — not whatever
        // the rate happens to be by the time the payment settles.
        Commission split = Commission.split(course.getPriceCents(), commissionService.currentRatePercent());

        return paymentGateway.createCheckout(new PaymentGateway.CheckoutRequest(
                course.getTitle(),
                course.getPriceCents(),
                appProperties.currency(),
                student.email(),
                split.platformCents(),
                instructor.getStripeAccountId(),
                Map.of(
                        META_COURSE_ID, course.getId().toString(),
                        META_STUDENT_ID, student.id().toString(),
                        META_COMMISSION_CENTS, Integer.toString(split.platformCents())),
                appProperties.frontendLink("/student?purchased=" + course.getSlug()),
                appProperties.frontendLink("/courses/" + course.getSlug() + "?checkout=cancelled")));
    }
}
