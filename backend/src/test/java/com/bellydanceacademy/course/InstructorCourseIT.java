package com.bellydanceacademy.course;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.bellydanceacademy.lesson.Lesson;
import com.bellydanceacademy.support.IntegrationTest;
import com.bellydanceacademy.support.TestData;
import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.http.Cookie;
import java.util.List;
import org.junit.jupiter.api.Test;

class InstructorCourseIT extends IntegrationTest {

    private static final String COURSE_FORM = """
            {"title":"%s","description":"d","about":"a","level":"BEGINNER","style":"Baladi",
             "priceCents":4900,"originalPriceCents":null,"durationLabel":"2h"}""";

    @Test
    void newCoursesStayHiddenUntilAnAdminApprovesThem() throws Exception {
        Cookie instructor = login(data.instructor());
        String title = "Shimmy Lab " + TestData.unique();

        String created = mvc.perform(json(post("/api/instructor/courses"), COURSE_FORM.formatted(title)).cookie(instructor))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn().getResponse().getContentAsString();
        String slug = JsonPath.read(created, "$.slug");
        Integer id = JsonPath.read(created, "$.id");

        mvc.perform(get("/api/courses/{slug}", slug)).andExpect(status().isNotFound());

        mvc.perform(post("/api/admin/courses/{id}/approve", id).with(csrf()).cookie(login(data.admin())))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/courses/{slug}", slug))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.course.title").value(title));
    }

    @Test
    void instructorsCannotSeeOrEditEachOthersCourses() throws Exception {
        Course othersCourse = data.pendingCourse(data.instructor());
        Cookie intruder = login(data.instructor());

        mvc.perform(get("/api/instructor/courses/{id}", othersCourse.getId()).cookie(intruder))
                .andExpect(status().isNotFound());
        mvc.perform(json(put("/api/instructor/courses/{id}", othersCourse.getId()), COURSE_FORM.formatted("Hijacked")).cookie(intruder))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/instructor/courses/{id}/lessons", othersCourse.getId()).cookie(intruder))
                .andExpect(status().isNotFound());
    }

    @Test
    void studentsCannotUseTheInstructorStudio() throws Exception {
        mvc.perform(get("/api/instructor/dashboard").cookie(login(data.student())))
                .andExpect(status().isForbidden());
    }

    @Test
    void lessonsAreAppendedAndReorderedBySwapping() throws Exception {
        TestData.Account owner = data.instructor();
        Course course = data.pendingCourse(owner);
        List<Lesson> lessons = data.lessons(course, 2);
        Cookie session = login(owner);

        mvc.perform(json(post("/api/instructor/courses/{id}/lessons", course.getId()), "{\"title\":\"Encore\",\"preview\":false}").cookie(session))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.position").value(3));

        mvc.perform(json(post("/api/instructor/lessons/{id}/move", lessons.get(1).getId()), "{\"direction\":\"UP\"}").cookie(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(lessons.get(1).getId()))
                .andExpect(jsonPath("$[1].id").value(lessons.get(0).getId()))
                .andExpect(jsonPath("$[2].title").value("Encore"));
    }

    @Test
    void validationErrorsComeBackPerField() throws Exception {
        mvc.perform(json(post("/api/instructor/courses"), "{\"title\":\"\",\"level\":\"BEGINNER\",\"priceCents\":0}")
                        .cookie(login(data.instructor())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.fieldErrors.title").exists())
                .andExpect(jsonPath("$.fieldErrors.priceCents").exists());
    }
}
