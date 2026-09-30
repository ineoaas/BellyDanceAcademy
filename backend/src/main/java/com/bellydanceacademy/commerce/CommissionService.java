package com.bellydanceacademy.commerce;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommissionService {

    private final PlatformSettingsRepository settings;

    CommissionService(PlatformSettingsRepository settings) {
        this.settings = settings;
    }

    @Transactional(readOnly = true)
    public int currentRatePercent() {
        return settings.load().getCommissionRatePercent();
    }

    /**
     * Only affects checkouts started from now on: each purchase snapshots
     * its own split, so a rate change never rewrites past sales.
     */
    @Transactional
    public int changeRate(int percent) {
        settings.load().changeCommissionRate(percent);
        return percent;
    }
}
