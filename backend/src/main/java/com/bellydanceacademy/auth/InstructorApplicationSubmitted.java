package com.bellydanceacademy.auth;

/** Published once a pending instructor account is committed. */
public record InstructorApplicationSubmitted(Long userId, String name, String email) {
}
