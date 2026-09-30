package com.bellydanceacademy.user;

public enum Role {
    STUDENT,
    INSTRUCTOR,
    ADMIN;

    /** Spring Security authority name, e.g. {@code ROLE_ADMIN}. */
    public String authority() {
        return "ROLE_" + name();
    }
}
