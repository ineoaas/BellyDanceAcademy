package com.bellydanceacademy.catalog;

import com.bellydanceacademy.common.error.NotFoundException;
import com.bellydanceacademy.course.CourseQueryService;
import com.bellydanceacademy.course.CourseSearchCriteria;
import com.bellydanceacademy.instructor.InstructorListing;
import com.bellydanceacademy.instructor.InstructorProfile;
import com.bellydanceacademy.instructor.InstructorProfileRepository;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Public instructor pages. Only instructors who've saved a profile are
 * listed, so an approved instructor never shows up as an empty page.
 */
@Service
@Transactional(readOnly = true)
public class InstructorDirectoryService {

    private final InstructorProfileRepository profiles;
    private final CourseQueryService courseQueries;
    private final CatalogService catalog;

    InstructorDirectoryService(InstructorProfileRepository profiles, CourseQueryService courseQueries,
                               CatalogService catalog) {
        this.profiles = profiles;
        this.courseQueries = courseQueries;
        this.catalog = catalog;
    }

    public List<InstructorSummary> list() {
        Map<Long, Long> courseCounts = courseQueries.liveCourseCountByInstructor();
        return profiles.findPublicListings().stream()
                .map(listing -> InstructorSummary.from(listing,
                        courseCounts.getOrDefault(listing.profile().getUserId(), 0L)))
                .toList();
    }

    public long count() {
        return profiles.countPublic();
    }

    public InstructorPage page(String slug) {
        InstructorListing listing = profiles.findPublicListing(slug).orElseThrow(() -> new NotFoundException("Instructor"));
        InstructorProfile profile = listing.profile();
        return new InstructorPage(profile.getSlug(), listing.name(), profile.getCity(), profile.getBio(),
                profile.getCredentials(), catalog.search(CourseSearchCriteria.byInstructor(profile.getUserId())));
    }

    /** @param userId what the catalog's instructor filter takes */
    public record InstructorSummary(Long userId, String slug, String name, String city, long courseCount) {

        static InstructorSummary from(InstructorListing listing, long courseCount) {
            InstructorProfile profile = listing.profile();
            return new InstructorSummary(profile.getUserId(), profile.getSlug(), listing.name(), profile.getCity(),
                    courseCount);
        }
    }

    public record InstructorPage(String slug, String name, String city, String bio, String credentials,
                                 List<CourseCard> courses) {
    }
}
