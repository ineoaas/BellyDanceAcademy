package com.bellydanceacademy.catalog;

import com.bellydanceacademy.course.CourseLevel;
import com.bellydanceacademy.course.CourseSearchCriteria;
import com.bellydanceacademy.course.CourseSort;
import com.bellydanceacademy.user.AuthenticatedUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/courses")
class CatalogController {

    private final CatalogService catalog;

    CatalogController(CatalogService catalog) {
        this.catalog = catalog;
    }

    /** Every filter is optional; prices are in cents. */
    @GetMapping
    List<CourseCard> search(@Valid CatalogQuery query) {
        return catalog.search(query.toCriteria());
    }

    @GetMapping("/styles")
    List<String> styles() {
        return catalog.styles();
    }

    @GetMapping("/{slug}")
    CourseDetail detail(@PathVariable String slug, @AuthenticationPrincipal AuthenticatedUser viewer) {
        return catalog.detail(slug, viewer);
    }

    record CatalogQuery(
            @Size(max = 100) String q,
            @Size(max = 60) String style,
            CourseLevel level,
            Long instructorId,
            @PositiveOrZero Integer minPriceCents,
            @PositiveOrZero Integer maxPriceCents,
            CourseSort sort) {

        CourseSearchCriteria toCriteria() {
            return new CourseSearchCriteria(q, style, level, instructorId, minPriceCents, maxPriceCents,
                    sort != null ? sort : CourseSort.NEWEST);
        }
    }
}
