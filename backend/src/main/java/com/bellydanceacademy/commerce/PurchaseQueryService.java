package com.bellydanceacademy.commerce;

import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Read access to purchases for other modules. */
@Service
@Transactional(readOnly = true)
public class PurchaseQueryService {

    private final PurchaseRepository purchases;

    PurchaseQueryService(PurchaseRepository purchases) {
        this.purchases = purchases;
    }

    /** The purchase that proves a student really bought a course (e.g. to review it). */
    public Optional<Purchase> findPaidPurchase(Long studentId, Long courseId) {
        return purchases.findFirstByStudentIdAndCourseIdAndStatus(studentId, courseId, PurchaseStatus.PAID);
    }

    public long platformRevenueCents() {
        return purchases.sumPlatformRevenueCents();
    }
}
