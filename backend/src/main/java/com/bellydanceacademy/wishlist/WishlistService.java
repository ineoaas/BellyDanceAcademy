package com.bellydanceacademy.wishlist;

import com.bellydanceacademy.course.CourseQueryService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Add and remove are both idempotent, so double-clicks and retries are harmless. */
@Service
public class WishlistService {

    private final WishlistRepository wishlist;
    private final CourseQueryService courseQueries;

    WishlistService(WishlistRepository wishlist, CourseQueryService courseQueries) {
        this.wishlist = wishlist;
        this.courseQueries = courseQueries;
    }

    @Transactional(readOnly = true)
    public List<WishlistEntry> list(Long studentId) {
        return wishlist.findEntriesForStudent(studentId);
    }

    @Transactional(readOnly = true)
    public boolean contains(Long studentId, Long courseId) {
        return wishlist.existsById(new WishlistItem.Key(studentId, courseId));
    }

    @Transactional
    public void add(Long studentId, Long courseId) {
        courseQueries.getById(courseId);
        if (!contains(studentId, courseId)) {
            wishlist.save(new WishlistItem(studentId, courseId));
        }
    }

    @Transactional
    public void remove(Long studentId, Long courseId) {
        wishlist.deleteById(new WishlistItem.Key(studentId, courseId));
    }
}
