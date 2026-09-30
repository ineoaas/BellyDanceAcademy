package com.bellydanceacademy.auth;

import com.bellydanceacademy.common.error.ConflictException;
import com.bellydanceacademy.common.error.UnauthorizedException;
import com.bellydanceacademy.user.User;
import com.bellydanceacademy.user.UserRepository;
import com.bellydanceacademy.user.UserStatus;
import java.util.Optional;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher events;
    /** Compared against when the email is unknown, so response time doesn't reveal which emails exist. */
    private final String timingDecoyHash;

    AuthService(UserRepository users, PasswordEncoder passwordEncoder, ApplicationEventPublisher events) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.events = events;
        this.timingDecoyHash = passwordEncoder.encode("timing-decoy-password");
    }

    /**
     * Pending instructors get a specific message; every other failure
     * (unknown email, wrong password, suspended, rejected) is the same
     * generic error so accounts can't be fingerprinted.
     */
    @Transactional(readOnly = true)
    public User authenticate(String email, String password) {
        Optional<User> candidate = users.findByEmail(User.normalizeEmail(email));
        String hash = candidate.map(User::getPasswordHash).orElse(timingDecoyHash);
        boolean passwordMatches = passwordEncoder.matches(password, hash);

        User user = candidate.filter(ignored -> passwordMatches)
                .orElseThrow(AuthService::invalidCredentials);
        if (user.getStatus() == UserStatus.PENDING) {
            throw new UnauthorizedException("ACCOUNT_PENDING",
                    "Your instructor application is still under review — we'll email you once it's approved.");
        }
        if (!user.isActive()) {
            throw invalidCredentials();
        }
        return user;
    }

    @Transactional
    public User registerStudent(String name, String email, String password) {
        return create(User.newStudent(name, email, passwordEncoder.encode(password)));
    }

    /**
     * Instructor accounts are created PENDING and are never signed in here —
     * an admin has to approve them first. The admin is notified by email
     * once the account is committed.
     */
    @Transactional
    public User applyAsInstructor(String name, String email, String password) {
        User applicant = create(User.newInstructorApplicant(name, email, passwordEncoder.encode(password)));
        events.publishEvent(new InstructorApplicationSubmitted(applicant.getId(), applicant.getName(), applicant.getEmail()));
        return applicant;
    }

    private User create(User user) {
        if (users.existsByEmail(user.getEmail())) {
            throw emailTaken();
        }
        try {
            return users.saveAndFlush(user);
        } catch (DataIntegrityViolationException raceLost) {
            throw emailTaken();
        }
    }

    private static UnauthorizedException invalidCredentials() {
        return new UnauthorizedException("INVALID_CREDENTIALS", "That email and password don't match an account.");
    }

    private static ConflictException emailTaken() {
        return new ConflictException("EMAIL_TAKEN", "An account with that email already exists — try logging in instead.");
    }
}
