package com.bellydanceacademy.commerce;

import com.bellydanceacademy.commerce.InstructorEarningsService.EarningsDashboard;
import com.bellydanceacademy.commerce.InstructorEarningsService.StripeStatus;
import com.bellydanceacademy.user.AuthenticatedUser;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/instructor")
class InstructorEarningsController {

    private final InstructorEarningsService earnings;

    InstructorEarningsController(InstructorEarningsService earnings) {
        this.earnings = earnings;
    }

    @GetMapping("/dashboard")
    DashboardResponse dashboard(@AuthenticationPrincipal AuthenticatedUser me) {
        return DashboardResponse.from(earnings.dashboard(me.id()));
    }

    @PostMapping("/stripe/onboarding-link")
    RedirectResponse stripeOnboarding(@AuthenticationPrincipal AuthenticatedUser me) {
        return new RedirectResponse(earnings.onboardingLink(me.id()));
    }

    @PostMapping("/payouts")
    @ResponseStatus(HttpStatus.CREATED)
    PayoutResponse requestPayout(@AuthenticationPrincipal AuthenticatedUser me) {
        return PayoutResponse.from(earnings.requestPayout(me.id()));
    }

    record RedirectResponse(String url) {
    }

    record DashboardResponse(StripeStatus stripe, EarningsDashboard.Totals totals, List<CourseSales> courses,
                             List<PayoutResponse> payouts) {

        static DashboardResponse from(EarningsDashboard dashboard) {
            return new DashboardResponse(dashboard.stripe(), dashboard.totals(), dashboard.courses(),
                    dashboard.payouts().stream().map(PayoutResponse::from).toList());
        }
    }
}
