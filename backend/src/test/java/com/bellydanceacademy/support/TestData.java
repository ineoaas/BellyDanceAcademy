package com.bellydanceacademy.support;

import com.bellydanceacademy.course.Course;
import com.bellydanceacademy.course.CourseDetails;
import com.bellydanceacademy.course.CourseLevel;
import com.bellydanceacademy.course.CourseRepository;
import com.bellydanceacademy.lesson.Lesson;
import com.bellydanceacademy.lesson.LessonRepository;
import com.bellydanceacademy.user.Role;
import com.bellydanceacademy.user.User;
import com.bellydanceacademy.user.UserRepository;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;
import org.springframework.boot.test.context.TestComponent;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Builds uniquely-named fixtures directly through repositories. */
@TestComponent
public class TestData {

    public static final String PASSWORD = "correct-horse-battery";

    private final UserRepository users;
    private final CourseRepository courses;
    private final LessonRepository lessons;
    private final PasswordEncoder passwordEncoder;

    TestData(UserRepository users, CourseRepository courses, LessonRepository lessons, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.courses = courses;
        this.lessons = lessons;
        this.passwordEncoder = passwordEncoder;
    }

    public Account student() {
        return account(Role.STUDENT);
    }

    public Account instructor() {
        return account(Role.INSTRUCTOR);
    }

    public Account admin() {
        return account(Role.ADMIN);
    }

    public Account payableInstructor() {
        Account account = instructor();
        User user = users.findById(account.id()).orElseThrow();
        user.connectStripeAccount("acct_" + unique());
        user.updateStripePayoutsEnabled(true);
        users.save(user);
        return account;
    }

    public Course liveCourse(Account instructor, int priceCents) {
        return courses.save(Course.live(instructor.id(), "course-" + unique(), details("Live " + unique(), priceCents)));
    }

    public Course pendingCourse(Account instructor) {
        return courses.save(Course.submitForReview(instructor.id(), "course-" + unique(), details("Pending " + unique(), 5000)));
    }

    /** First lesson is a free preview; each lesson is 100 seconds long. */
    public List<Lesson> lessons(Course course, int count) {
        return IntStream.rangeClosed(1, count)
                .mapToObj(position -> lessons.save(
                        Lesson.withDuration(course.getId(), position, "Lesson " + position, position == 1, 100)))
                .toList();
    }

    private Account account(Role role) {
        String email = role.name().toLowerCase() + "-" + unique() + "@example.test";
        User user = users.save(User.newActive("Test " + role.name().toLowerCase(), email, passwordEncoder.encode(PASSWORD), role));
        return new Account(user.getId(), email, PASSWORD);
    }

    private static CourseDetails details(String title, int priceCents) {
        return new CourseDetails(title, "Short description", "About", CourseLevel.BEGINNER, "Baladi", priceCents, null, "1h");
    }

    public static String unique() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    public record Account(Long id, String email, String password) {
    }
}
