package com.bellydanceacademy.dev;

import com.bellydanceacademy.course.Course;
import com.bellydanceacademy.course.CourseDetails;
import com.bellydanceacademy.course.CourseLevel;
import com.bellydanceacademy.course.CourseRepository;
import com.bellydanceacademy.instructor.InstructorProfileService;
import com.bellydanceacademy.lesson.Lesson;
import com.bellydanceacademy.lesson.LessonRepository;
import com.bellydanceacademy.user.Role;
import com.bellydanceacademy.user.User;
import com.bellydanceacademy.user.UserRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Demo accounts and courses for local development ({@code dev} profile
 * only). Idempotent: skips anything that already exists.
 */
@Component
@Profile("dev")
class DevDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);

    private final UserRepository users;
    private final CourseRepository courses;
    private final LessonRepository lessons;
    private final InstructorProfileService profiles;
    private final PasswordEncoder passwordEncoder;

    DevDataSeeder(UserRepository users, CourseRepository courses, LessonRepository lessons,
                  InstructorProfileService profiles, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.courses = courses;
        this.lessons = lessons;
        this.profiles = profiles;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedAccount("Nadia Karim", "student@example.com", "student123", Role.STUDENT);
        seedAccount("Site Admin", "admin@example.com", "admin123", Role.ADMIN);
        for (DemoInstructor instructor : INSTRUCTORS) {
            User user = seedAccount(instructor.name(), instructor.email(), "instructor123", Role.INSTRUCTOR);
            if (profiles.findForUser(user.getId()).isEmpty()) {
                profiles.save(user.getId(), user.getName(), instructor.city(), instructor.bio(), instructor.credentials());
            }
        }
        for (DemoCourse course : COURSES) {
            seedCourse(course);
        }
    }

    private User seedAccount(String name, String email, String password, Role role) {
        return users.findByEmail(email).orElseGet(() -> {
            log.info("Seeding {} account {} / {}", role, email, password);
            return users.save(User.newActive(name, email, passwordEncoder.encode(password), role));
        });
    }

    private void seedCourse(DemoCourse demo) {
        if (courses.existsBySlug(demo.slug())) {
            return;
        }
        User instructor = users.findByEmail(demo.instructorEmail()).orElseThrow();
        Course course = courses.save(Course.live(instructor.getId(), demo.slug(), new CourseDetails(
                demo.title(), demo.description(), demo.about(), demo.level(), demo.style(),
                demo.priceCents(), demo.originalPriceCents(), demo.duration())));

        for (int i = 0; i < demo.lessons().size(); i++) {
            DemoLesson lesson = demo.lessons().get(i);
            lessons.save(Lesson.withDuration(course.getId(), i + 1, lesson.title(), i == 0, toSeconds(lesson.length())));
        }
        log.info("Seeded course {} ({} lessons)", demo.slug(), demo.lessons().size());
    }

    /** "12:40" → 760. */
    private static int toSeconds(String length) {
        String[] parts = length.split(":");
        return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
    }

    private record DemoInstructor(String name, String email, String city, String bio, String credentials) {
    }

    private record DemoLesson(String title, String length) {
    }

    private record DemoCourse(String slug, String title, String instructorEmail, CourseLevel level, String style,
                              int priceCents, int originalPriceCents, String duration, String description,
                              String about, List<DemoLesson> lessons) {
    }

    private static final List<DemoInstructor> INSTRUCTORS = List.of(
            new DemoInstructor("Amara Nour", "instructor@example.com", "Cairo, Egypt",
                    "Cairo-trained in Baladi and Saidi, with over a decade performing on Egypt's wedding and hotel-show circuit before moving to teaching full time.",
                    "10+ years performing, Cairo"),
            new DemoInstructor("Leyla Marín", "leyla@example.com", "Barcelona, Spain",
                    "A veil-work specialist blending Spanish theatrical training with classical Oriental technique, now teaching dancers preparing for their first solo.",
                    "Conservatory-trained, Barcelona"),
            new DemoInstructor("Dalia Rostam", "dalia@example.com", "Istanbul, Turkey",
                    "Known for sharp, percussive drum solo work built on years of live tabla accompaniment across Istanbul's performance venues.",
                    "Istanbul performance circuit"),
            new DemoInstructor("Farah Idris", "farah@example.com", "Beirut, Lebanon",
                    "A finishing-school approach to arm and hand styling — the small technical details that separate trained movement from improvised.",
                    "Beirut studio instructor"));

    private static final List<DemoCourse> COURSES = List.of(
            new DemoCourse("egyptian-baladi-foundations", "Egyptian Baladi — Foundations", "instructor@example.com",
                    CourseLevel.BEGINNER, "Baladi", 5900, 8900, "6h 40m",
                    "Posture, isolations and the walk that anchors every style.",
                    "This course lays the technical foundation for Egyptian Baladi — the social, earthy style underlying almost every Oriental dance vocabulary. No dance background required.",
                    List.of(new DemoLesson("Posture & Grounding", "12:40"), new DemoLesson("The Egyptian Walk", "18:05"),
                            new DemoLesson("Hip Isolations, Part 1", "22:30"), new DemoLesson("Ribcage & Chest Work", "21:47"))),
            new DemoCourse("veil-work-stage-presence", "Veil Work & Stage Presence", "leyla@example.com",
                    CourseLevel.INTERMEDIATE, "Veil Work", 8900, 12000, "5h 10m",
                    "Choreograph flowing veil entrances for solo performance.",
                    "Build a complete veil entrance from the ground up — carriage, fabric control, and the stagecraft that makes an audience lean in.",
                    List.of(new DemoLesson("Choosing & Handling Your Veil", "10:12"), new DemoLesson("The Entrance Wrap", "16:40"),
                            new DemoLesson("Floating Transitions", "19:05"), new DemoLesson("Exit & Reveal", "14:22"))),
            new DemoCourse("drum-solo-choreography", "Drum Solo Choreography", "dalia@example.com",
                    CourseLevel.ADVANCED, "Drum Solo", 11000, 14000, "7h 05m",
                    "Sharp accents and layered rhythm for competition-ready sets.",
                    "Advanced accent work set to shifting tabla rhythms, built for dancers preparing a competition or showcase solo.",
                    List.of(new DemoLesson("Reading the Rhythm", "15:30"), new DemoLesson("Sharp Accents, Part 1", "20:11"),
                            new DemoLesson("Layered Combinations", "23:47"), new DemoLesson("Building Your 90-Second Solo", "18:02"))),
            new DemoCourse("arm-hand-styling-essentials", "Arm & Hand Styling Essentials", "farah@example.com",
                    CourseLevel.BEGINNER, "Styling", 4900, 6500, "3h 20m",
                    "The details that separate graceful from generic.",
                    "Finishing-school work for the arms and hands — the small adjustments that instantly read as trained rather than improvised.",
                    List.of(new DemoLesson("Wrist & Finger Isolation", "9:40"), new DemoLesson("Arm Frames", "12:15"),
                            new DemoLesson("Hands Through Turns", "13:52"))),
            new DemoCourse("saidi-cane-dance", "Saidi & the Cane Dance", "instructor@example.com",
                    CourseLevel.INTERMEDIATE, "Saidi", 7500, 9500, "4h 45m",
                    "Playful upper-Egyptian rhythm work with the assaya cane.",
                    "A joyful, grounded style from Upper Egypt built around the assaya (cane) — playful, percussive, and a crowd favorite.",
                    List.of(new DemoLesson("Cane Handling Basics", "11:20"), new DemoLesson("Saidi Rhythm & Weight", "17:35"),
                            new DemoLesson("Cane Spins", "16:48"))),
            new DemoCourse("five-minute-solo", "Building a 5-Minute Solo", "leyla@example.com",
                    CourseLevel.ADVANCED, "Choreography", 12000, 15000, "6h 15m",
                    "Structure, staging and musicality for a showcase-ready set.",
                    "Everything that goes into a performance-ready solo: musical phrasing, staging, costume considerations, and how to rehearse it into muscle memory.",
                    List.of(new DemoLesson("Choosing Your Music", "14:10"), new DemoLesson("Structuring the Arc", "19:26"),
                            new DemoLesson("Staging for a Room", "17:03"))));
}
