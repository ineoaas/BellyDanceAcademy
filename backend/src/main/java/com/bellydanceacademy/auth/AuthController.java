package com.bellydanceacademy.auth;

import com.bellydanceacademy.user.AuthenticatedUser;
import com.bellydanceacademy.user.PasswordPolicy;
import com.bellydanceacademy.user.User;
import com.bellydanceacademy.user.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final SessionService sessionService;
    private final SessionCookies sessionCookies;

    AuthController(AuthService authService, PasswordResetService passwordResetService,
                   SessionService sessionService, SessionCookies sessionCookies) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
        this.sessionService = sessionService;
        this.sessionCookies = sessionCookies;
    }

    /**
     * The SPA's bootstrap call: who (if anyone) is signed in. Also
     * materialises the CSRF token so the XSRF-TOKEN cookie is always set
     * before the first state-changing request.
     */
    @GetMapping("/session")
    SessionResponse session(@AuthenticationPrincipal AuthenticatedUser me, CsrfToken csrfToken) {
        csrfToken.getToken();
        return me == null ? SessionResponse.anonymous()
                : new SessionResponse(new UserResponse(me.id(), me.name(), me.email(), me.role()));
    }

    @PostMapping("/login")
    SessionResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        return signIn(authService.authenticate(request.email(), request.password()), response);
    }

    @PostMapping("/logout")
    ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        sessionService.end(sessionCookies.read(request));
        sessionCookies.clear(response);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    SessionResponse registerStudent(@Valid @RequestBody RegistrationRequest request, HttpServletResponse response) {
        return signIn(authService.registerStudent(request.name(), request.email(), request.password()), response);
    }

    /** No session is started — the account waits for admin approval. */
    @PostMapping("/instructor-applications")
    @ResponseStatus(HttpStatus.ACCEPTED)
    void applyAsInstructor(@Valid @RequestBody RegistrationRequest request) {
        authService.applyAsInstructor(request.name(), request.email(), request.password());
    }

    @PostMapping("/password-reset")
    @ResponseStatus(HttpStatus.ACCEPTED)
    void requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        passwordResetService.requestReset(request.email());
    }

    /** The emailed link proves ownership, so the user is signed straight in. */
    @PostMapping("/password-reset/confirm")
    SessionResponse confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmation request,
                                         HttpServletResponse response) {
        User user = passwordResetService.resetPassword(request.token(), request.password());
        return user.isActive() ? signIn(user, response) : SessionResponse.anonymous();
    }

    private SessionResponse signIn(User user, HttpServletResponse response) {
        sessionCookies.write(response, sessionService.start(user.getId()));
        return new SessionResponse(UserResponse.from(user));
    }

    record SessionResponse(UserResponse user) {

        static SessionResponse anonymous() {
            return new SessionResponse(null);
        }
    }

    record LoginRequest(
            @NotBlank(message = "Enter your email.") String email,
            @NotBlank(message = "Enter your password.") String password) {
    }

    record RegistrationRequest(
            @NotBlank(message = "Please fill in your name.") @Size(max = 120) String name,
            @NotBlank(message = "Please fill in your email.") @Email(message = "Enter a valid email.") @Size(max = 254) String email,
            @NotBlank(message = PasswordPolicy.MESSAGE)
            @Size(min = PasswordPolicy.MIN_LENGTH, max = PasswordPolicy.MAX_LENGTH, message = PasswordPolicy.MESSAGE)
            String password) {
    }

    record PasswordResetRequest(@NotBlank(message = "Enter your email.") String email) {
    }

    record PasswordResetConfirmation(
            @NotBlank String token,
            @NotBlank(message = PasswordPolicy.MESSAGE)
            @Size(min = PasswordPolicy.MIN_LENGTH, max = PasswordPolicy.MAX_LENGTH, message = PasswordPolicy.MESSAGE)
            String password) {
    }
}
