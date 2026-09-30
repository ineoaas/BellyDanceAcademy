package com.bellydanceacademy.wishlist;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface WishlistRepository extends JpaRepository<WishlistItem, WishlistItem.Key> {

    @Query("""
            select new com.bellydanceacademy.wishlist.WishlistEntry(c.id, c.slug, c.title, u.name, c.priceCents)
            from WishlistItem w
              join Course c on c.id = w.id.courseId
              join User u on u.id = c.instructorId
            where w.id.studentId = :studentId
            order by w.createdAt desc
            """)
    List<WishlistEntry> findEntriesForStudent(Long studentId);
}
