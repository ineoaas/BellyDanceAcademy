package com.bellydanceacademy.course;

import org.springframework.data.domain.Sort;

public enum CourseSort {
    NEWEST(Sort.by(Sort.Direction.DESC, "createdAt")),
    PRICE_ASC(Sort.by(Sort.Direction.ASC, "priceCents").and(Sort.by(Sort.Direction.DESC, "createdAt"))),
    PRICE_DESC(Sort.by(Sort.Direction.DESC, "priceCents").and(Sort.by(Sort.Direction.DESC, "createdAt")));

    private final Sort sort;

    CourseSort(Sort sort) {
        this.sort = sort;
    }

    public Sort toSort() {
        return sort;
    }
}
