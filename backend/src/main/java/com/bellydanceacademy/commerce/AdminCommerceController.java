package com.bellydanceacademy.commerce;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
class AdminCommerceController {

    private final CommissionService commissionService;
    private final PayoutRepository payouts;

    AdminCommerceController(CommissionService commissionService, PayoutRepository payouts) {
        this.commissionService = commissionService;
        this.payouts = payouts;
    }

    @GetMapping("/settings/commission")
    CommissionRate commission() {
        return new CommissionRate(commissionService.currentRatePercent());
    }

    @PutMapping("/settings/commission")
    CommissionRate changeCommission(@Valid @RequestBody CommissionRate request) {
        return new CommissionRate(commissionService.changeRate(request.ratePercent()));
    }

    /**
     * Read-only ledger: payouts move automatically through Stripe Connect the
     * moment an instructor requests one — there's nothing for an admin to approve.
     */
    @GetMapping("/payouts")
    List<PayoutResponse> payouts() {
        return payouts.findAllWithInstructor().stream()
                .map(row -> PayoutResponse.from(row.payout(), row.instructorName()))
                .toList();
    }

    record CommissionRate(
            @NotNull(message = "Enter a whole number between 0 and 100.")
            @Min(value = 0, message = "Enter a whole number between 0 and 100.")
            @Max(value = 100, message = "Enter a whole number between 0 and 100.")
            Integer ratePercent) {
    }
}
