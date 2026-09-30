package com.bellydanceacademy.user;

import com.bellydanceacademy.common.error.BusinessRuleException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Locale;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    private String stripeAccountId;

    @Column(nullable = false)
    private boolean stripePayoutsEnabled;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected User() {
    }

    private User(String name, String email, String passwordHash, Role role, UserStatus status) {
        this.name = name.trim();
        this.email = normalizeEmail(email);
        this.passwordHash = passwordHash;
        this.role = role;
        this.status = status;
    }

    /** Students self-register and can sign in immediately. */
    public static User newStudent(String name, String email, String passwordHash) {
        return new User(name, email, passwordHash, Role.STUDENT, UserStatus.ACTIVE);
    }

    /** Instructors stay {@link UserStatus#PENDING} until an admin approves them. */
    public static User newInstructorApplicant(String name, String email, String passwordHash) {
        return new User(name, email, passwordHash, Role.INSTRUCTOR, UserStatus.PENDING);
    }

    public static User newActive(String name, String email, String passwordHash, Role role) {
        return new User(name, email, passwordHash, role, UserStatus.ACTIVE);
    }

    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public void updateProfile(String name, String email) {
        this.name = name.trim();
        this.email = normalizeEmail(email);
    }

    public void changePasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void approveApplication() {
        requireStatus(UserStatus.PENDING, "Only pending applications can be approved.");
        status = UserStatus.ACTIVE;
    }

    public void rejectApplication() {
        requireStatus(UserStatus.PENDING, "Only pending applications can be rejected.");
        status = UserStatus.REJECTED;
    }

    public void suspend() {
        requireStatus(UserStatus.ACTIVE, "Only active accounts can be suspended.");
        status = UserStatus.SUSPENDED;
    }

    public void reactivate() {
        requireStatus(UserStatus.SUSPENDED, "Only suspended accounts can be reactivated.");
        status = UserStatus.ACTIVE;
    }

    public void connectStripeAccount(String stripeAccountId) {
        this.stripeAccountId = stripeAccountId;
    }

    public void updateStripePayoutsEnabled(boolean enabled) {
        this.stripePayoutsEnabled = enabled;
    }

    public boolean isActive() {
        return status == UserStatus.ACTIVE;
    }

    public boolean canReceivePayouts() {
        return stripeAccountId != null && stripePayoutsEnabled;
    }

    private void requireStatus(UserStatus expected, String message) {
        if (status != expected) {
            throw new BusinessRuleException("INVALID_STATUS_TRANSITION", message);
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public String getStripeAccountId() {
        return stripeAccountId;
    }

    public boolean isStripePayoutsEnabled() {
        return stripePayoutsEnabled;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
