package com.bellydanceacademy.commerce;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** The single platform-wide settings row (id is always 1). */
@Entity
@Table(name = "platform_settings")
class PlatformSettings {

    static final short SINGLETON_ID = 1;

    @Id
    private Short id;

    @Column(nullable = false)
    private int commissionRatePercent;

    protected PlatformSettings() {
    }

    int getCommissionRatePercent() {
        return commissionRatePercent;
    }

    void changeCommissionRate(int percent) {
        this.commissionRatePercent = percent;
    }
}
