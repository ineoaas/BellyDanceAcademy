package com.bellydanceacademy.review;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByStudentIdAndCourseId(Long studentId, Long courseId);

    @Query("""
            select new com.bellydanceacademy.review.RatingSummary(r.courseId, avg(r.rating), count(r))
            from Review r
            where r.courseId in :courseIds and r.status = com.bellydanceacademy.review.ReviewStatus.VISIBLE
            group by r.courseId
            """)
    List<RatingSummary> summarize(Collection<Long> courseIds);

    @Query("""
            select new com.bellydanceacademy.review.ReviewView(r, u.name, c.title, c.slug)
            from Review r join User u on u.id = r.studentId join Course c on c.id = r.courseId
            where r.courseId = :courseId and r.status = com.bellydanceacademy.review.ReviewStatus.VISIBLE
            order by r.createdAt desc
            """)
    List<ReviewView> findVisibleForCourse(Long courseId);

    @Query("""
            select new com.bellydanceacademy.review.ReviewView(r, u.name, c.title, c.slug)
            from Review r join User u on u.id = r.studentId join Course c on c.id = r.courseId
            order by r.createdAt desc
            """)
    List<ReviewView> findAllForModeration();

    /** The best-rated visible review that actually says something — for the home page. */
    @Query("""
            select new com.bellydanceacademy.review.ReviewView(r, u.name, c.title, c.slug)
            from Review r join User u on u.id = r.studentId join Course c on c.id = r.courseId
            where r.status = com.bellydanceacademy.review.ReviewStatus.VISIBLE and r.comment <> ''
            order by r.rating desc, r.createdAt desc
            """)
    List<ReviewView> findFeatured(Limit limit);
}
