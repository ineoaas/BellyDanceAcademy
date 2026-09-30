package com.bellydanceacademy.commerce;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    boolean existsByStripeCheckoutSessionId(String stripeCheckoutSessionId);

    Optional<Purchase> findByStripePaymentIntentId(String stripePaymentIntentId);

    Optional<Purchase> findFirstByStudentIdAndCourseIdAndStatus(Long studentId, Long courseId, PurchaseStatus status);

    @Query("select coalesce(sum(p.commissionCents), 0) from Purchase p where p.status = com.bellydanceacademy.commerce.PurchaseStatus.PAID")
    long sumPlatformRevenueCents();

    /** Per-course sales for one instructor, including courses with no sales yet. */
    @Query("""
            select new com.bellydanceacademy.commerce.CourseSales(
                c.id, c.slug, c.title, c.status, count(p.id), coalesce(sum(p.instructorEarningsCents), 0))
            from Course c
              left join Purchase p on p.courseId = c.id and p.status = com.bellydanceacademy.commerce.PurchaseStatus.PAID
            where c.instructorId = :instructorId
            group by c.id, c.slug, c.title, c.status, c.createdAt
            order by c.createdAt desc
            """)
    List<CourseSales> findCourseSalesForInstructor(Long instructorId);
}
