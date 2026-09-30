package com.bellydanceacademy.commerce;

import com.bellydanceacademy.user.AuthenticatedUser;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class CheckoutController {

    private final CheckoutService checkoutService;

    CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping("/api/courses/{slug}/checkout")
    @PreAuthorize("hasRole('STUDENT')")
    CheckoutResponse startCheckout(@AuthenticationPrincipal AuthenticatedUser me, @PathVariable String slug) {
        return new CheckoutResponse(checkoutService.startCheckout(me, slug));
    }

    record CheckoutResponse(String checkoutUrl) {
    }
}
