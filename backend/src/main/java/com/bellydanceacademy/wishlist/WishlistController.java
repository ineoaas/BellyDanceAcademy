package com.bellydanceacademy.wishlist;

import com.bellydanceacademy.user.AuthenticatedUser;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me/wishlist")
@PreAuthorize("hasRole('STUDENT')")
class WishlistController {

    private final WishlistService wishlistService;

    WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    List<WishlistEntry> list(@AuthenticationPrincipal AuthenticatedUser me) {
        return wishlistService.list(me.id());
    }

    @PutMapping("/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void add(@AuthenticationPrincipal AuthenticatedUser me, @PathVariable Long courseId) {
        wishlistService.add(me.id(), courseId);
    }

    @DeleteMapping("/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void remove(@AuthenticationPrincipal AuthenticatedUser me, @PathVariable Long courseId) {
        wishlistService.remove(me.id(), courseId);
    }
}
