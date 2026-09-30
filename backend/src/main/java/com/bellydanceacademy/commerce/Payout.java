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

@Entity
@Table(name = "payouts")
public class Payout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private Long instructorId;

    @Column(nullable = false, updatable = false)
    private int amountCents;

    @Column(nullable = false, updatable = false)
    private String currency;

    private String stripePayoutId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PayoutStatus status;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant requestedAt;

    protected Payout() {
    }

    Payout(Long instructorId, int amountCents, String currency, String stripePayoutId, PayoutStatus status) {
        this.instructorId = instructorId;
        this.amountCents = amountCents;
        this.currency = currency;
        this.stripePayoutId = stripePayoutId;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public int getAmountCents() {
        return amountCents;
    }

    public String getCurrency() {
        return currency;
    }

    public PayoutStatus getStatus() {
        return status;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }
}
