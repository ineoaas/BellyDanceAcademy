package com.bellydanceacademy.user;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
class AccountController {

    private final AccountService accountService;

    AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PutMapping("/profile")
    UserResponse updateProfile(@AuthenticationPrincipal AuthenticatedUser me,
                               @Valid @RequestBody UpdateProfileRequest request) {
        return UserResponse.from(accountService.updateProfile(me.id(), request.name(), request.email()));
    }

    @PutMapping("/password")
    ResponseEntity<Void> changePassword(@AuthenticationPrincipal AuthenticatedUser me,
                                        @Valid @RequestBody ChangePasswordRequest request) {
        accountService.changePassword(me.id(), request.currentPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    record UpdateProfileRequest(
            @NotBlank(message = "Please fill in your name.") @Size(max = 120) String name,
            @NotBlank(message = "Please fill in your email.") @Email(message = "Enter a valid email.") @Size(max = 254) String email) {
    }

    record ChangePasswordRequest(
            @NotBlank(message = "Enter your current password.") String currentPassword,
            @NotBlank @Size(min = PasswordPolicy.MIN_LENGTH, max = PasswordPolicy.MAX_LENGTH,
                    message = PasswordPolicy.MESSAGE) String newPassword) {
    }
}
