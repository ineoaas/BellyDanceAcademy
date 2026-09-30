package com.bellydanceacademy.course;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

/** Translates catalog filters into a single parameterised query over live courses. */
final class CourseSpecifications {

    private CourseSpecifications() {
    }

    static Specification<Course> liveMatching(CourseSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), CourseStatus.LIVE));

            if (hasText(criteria.style())) {
                predicates.add(cb.equal(root.get("style"), criteria.style()));
            }
            if (criteria.level() != null) {
                predicates.add(cb.equal(root.get("level"), criteria.level()));
            }
            if (criteria.instructorId() != null) {
                predicates.add(cb.equal(root.get("instructorId"), criteria.instructorId()));
            }
            if (criteria.minPriceCents() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("priceCents"), criteria.minPriceCents()));
            }
            if (criteria.maxPriceCents() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("priceCents"), criteria.maxPriceCents()));
            }
            if (hasText(criteria.query())) {
                String pattern = "%" + escapeLike(criteria.query().trim().toLowerCase(Locale.ROOT)) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern, '\\'),
                        cb.like(cb.lower(root.get("description")), pattern, '\\')));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    /** So a search for "100%" matches literally instead of acting as a wildcard. */
    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
