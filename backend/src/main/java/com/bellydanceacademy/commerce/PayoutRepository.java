package com.bellydanceacademy.commerce;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface PayoutRepository extends JpaRepository<Payout, Long> {

    List<Payout> findByInstructorIdOrderByRequestedAtDesc(Long instructorId);

    @Query("""
            select new com.bellydanceacademy.commerce.PayoutWithInstructor(p, u.name)
            from Payout p join User u on u.id = p.instructorId
            order by p.requestedAt desc
            """)
    List<PayoutWithInstructor> findAllWithInstructor();
}
