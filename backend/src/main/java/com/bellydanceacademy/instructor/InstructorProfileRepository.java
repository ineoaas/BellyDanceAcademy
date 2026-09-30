package com.bellydanceacademy.instructor;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InstructorProfileRepository extends JpaRepository<InstructorProfile, Long> {

    Optional<InstructorProfile> findByUserId(Long userId);

    Optional<InstructorProfile> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<InstructorProfile> findByUserIdIn(Collection<Long> userIds);

    /** Profiles of active instructors — the public directory. */
    @Query("""
            select new com.bellydanceacademy.instructor.InstructorListing(p, u.name)
            from InstructorProfile p join User u on u.id = p.userId
            where u.status = com.bellydanceacademy.user.UserStatus.ACTIVE
            order by u.name
            """)
    List<InstructorListing> findPublicListings();

    @Query("""
            select count(p) from InstructorProfile p join User u on u.id = p.userId
            where u.status = com.bellydanceacademy.user.UserStatus.ACTIVE
            """)
    long countPublic();

    @Query("""
            select new com.bellydanceacademy.instructor.InstructorListing(p, u.name)
            from InstructorProfile p join User u on u.id = p.userId
            where p.slug = :slug and u.status = com.bellydanceacademy.user.UserStatus.ACTIVE
            """)
    Optional<InstructorListing> findPublicListing(String slug);
}
