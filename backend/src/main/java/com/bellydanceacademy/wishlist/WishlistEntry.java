package com.bellydanceacademy.wishlist;

public record WishlistEntry(Long courseId, String courseSlug, String courseTitle, String instructorName,
                            int priceCents) {
}
