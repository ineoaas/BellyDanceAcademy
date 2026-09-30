package com.bellydanceacademy.commerce;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.CreationTimestamp;

/**
 * A completed payment, amounts snapshotted at checkout. Only the status
 * changes afterwards, when the payment is refunded.
 */
@Entity
@Table(name = "purchases")
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private Long studentId;

    @Column(nullable = false, updatable = false)
    private Long courseId;

    @Column(nullable = false, updatable = false)
    private int amountCents;

    @Column(nullable = false, updatable = false)
    private int commissionCents;

    @Column(nullable = false, updatable = false)
    private int instructorEarningsCents;

    @Column(nullable = false, updatable = false)
    private String currency;

    @Column(nullable = false, unique = true, updatable = false)
    private String stripeCheckoutSessionId;

    private String stripePaymentIntentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PurchaseStatus status;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected Purchase() {
    }

    Purchase(Long studentId, Long courseId, int amountCents, Commission split, String currency,
             String stripeCheckoutSessionId, String stripePaymentIntentId) {
        this.studentId = studentId;
        this.courseId = courseId;
        this.amountCents = amountCents;
        this.commissionCents = split.platformCents();
        this.instructorEarningsCents = split.instructorCents();
        this.currency = currency;
        this.stripeCheckoutSessionId = stripeCheckoutSessionId;
        this.stripePaymentIntentId = stripePaymentIntentId;
        this.status = PurchaseStatus.PAID;
    }

    /** @return false if it was already refunded, so redelivered events are no-ops */
    boolean markRefunded() {
        if (status == PurchaseStatus.REFUNDED) {
            return false;
        }
        status = PurchaseStatus.REFUNDED;
        return true;
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public int getAmountCents() {
        return amountCents;
    }

    public String getCurrency() {
        return currency;
    }

    public PurchaseStatus getStatus() {
        return status;
    }
}
