package com.bellydanceacademy.commerce;

import com.bellydanceacademy.commerce.stripe.PaymentGateway;
import com.bellydanceacademy.common.error.BusinessRuleException;
import com.bellydanceacademy.common.error.ExternalServiceException;
import com.bellydanceacademy.common.error.NotFoundException;
import com.bellydanceacademy.config.AppProperties;
import com.bellydanceacademy.course.CourseStatus;
import com.bellydanceacademy.user.User;
import com.bellydanceacademy.user.UserRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * An instructor's sales, Stripe Connect onboarding and payouts.
 *
 * <p>Methods here call Stripe, so they're intentionally not wrapped in one
 * long transaction; each repository call commits on its own.
 */
@Service
public class InstructorEarningsService {

    private static final Logger log = LoggerFactory.getLogger(InstructorEarningsService.class);

    private final UserRepository users;
    private final PurchaseRepository purchases;
    private final PayoutRepository payouts;
    private final PaymentGateway paymentGateway;
    private final AppProperties appProperties;

    InstructorEarningsService(UserRepository users, PurchaseRepository purchases, PayoutRepository payouts,
                              PaymentGateway paymentGateway, AppProperties appProperties) {
        this.users = users;
        this.purchases = purchases;
        this.payouts = payouts;
        this.paymentGateway = paymentGateway;
        this.appProperties = appProperties;
    }

    public EarningsDashboard dashboard(Long instructorId) {
        User instructor = loadInstructor(instructorId);
        StripeStatus stripe = refreshStripeStatus(instructor);
        List<CourseSales> courseSales = purchases.findCourseSalesForInstructor(instructorId);

        return new EarningsDashboard(
                stripe,
                new EarningsDashboard.Totals(
                        courseSales.stream().mapToLong(CourseSales::revenueCents).sum(),
                        courseSales.stream().mapToLong(CourseSales::studentCount).sum(),
                        courseSales.stream().filter(sales -> sales.status() == CourseStatus.LIVE).count()),
                courseSales,
                payouts.findByInstructorIdOrderByRequestedAtDesc(instructorId));
    }

    /** First call creates the connected account; later calls resume its onboarding. */
    public String onboardingLink(Long instructorId) {
        User instructor = loadInstructor(instructorId);
        if (instructor.getStripeAccountId() == null) {
            instructor.connectStripeAccount(paymentGateway.createConnectedAccount(instructor.getEmail()));
            users.save(instructor);
        }
        return paymentGateway.createOnboardingLink(instructor.getStripeAccountId(),
                appProperties.frontendLink("/instructor?stripe=refresh"),
                appProperties.frontendLink("/instructor?stripe=return"));
    }

    /** Pays out the full available balance now, ahead of the normal schedule. */
    public Payout requestPayout(Long instructorId) {
        User instructor = loadInstructor(instructorId);
        if (!instructor.canReceivePayouts()) {
            throw new BusinessRuleException("PAYOUTS_NOT_ENABLED", "Finish setting up Stripe before requesting a payout.");
        }
        String currency = appProperties.currency();
        long availableCents = paymentGateway.availableBalanceCents(instructor.getStripeAccountId(), currency);
        if (availableCents <= 0) {
            throw new BusinessRuleException("NOTHING_TO_PAY_OUT", "Nothing available to pay out right now.");
        }
        PaymentGateway.PayoutResult result =
                paymentGateway.createPayout(instructor.getStripeAccountId(), availableCents, currency);
        return payouts.save(new Payout(instructorId, Math.toIntExact(availableCents), currency, result.id(),
                PayoutStatus.fromStripe(result.status())));
    }

    /**
     * Stripe is the source of truth for whether payouts are enabled; poll it
     * on each dashboard view and refresh the cached flag (which checkout
     * relies on). If Stripe is unreachable, fall back to the cached value.
     */
    private StripeStatus refreshStripeStatus(User instructor) {
        String accountId = instructor.getStripeAccountId();
        if (accountId == null) {
            return new StripeStatus(false, false, null);
        }
        try {
            boolean payoutsEnabled = paymentGateway.payoutsEnabled(accountId);
            if (payoutsEnabled != instructor.isStripePayoutsEnabled()) {
                instructor.updateStripePayoutsEnabled(payoutsEnabled);
                users.save(instructor);
            }
            Long availableCents = payoutsEnabled
                    ? paymentGateway.availableBalanceCents(accountId, appProperties.currency())
                    : null;
            return new StripeStatus(true, payoutsEnabled, availableCents);
        } catch (ExternalServiceException e) {
            log.warn("Could not refresh Stripe status for instructor {}", instructor.getId(), e);
            return new StripeStatus(true, instructor.isStripePayoutsEnabled(), null);
        }
    }

    private User loadInstructor(Long instructorId) {
        return users.findById(instructorId).orElseThrow(() -> new NotFoundException("Instructor"));
    }

    /** @param availableCents null when unknown (not enabled, or Stripe unreachable) */
    public record StripeStatus(boolean connected, boolean payoutsEnabled, Long availableCents) {
    }

    public record EarningsDashboard(StripeStatus stripe, Totals totals, List<CourseSales> courses,
                                    List<Payout> payouts) {

        public record Totals(long revenueCents, long studentCount, long liveCourseCount) {
        }
    }
}
