package com.bellydanceacademy.user;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.bellydanceacademy.support.IntegrationTest;
import com.bellydanceacademy.support.TestData;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;

class AdminUserIT extends IntegrationTest {

    @Test
    void adminsCannotModerateThemselves() throws Exception {
        TestData.Account admin = data.admin();

        mvc.perform(delete("/api/admin/users/{id}", admin.id()).with(csrf()).cookie(login(admin)))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("CANNOT_MODERATE_SELF"));
    }

    @Test
    void accountsWithHistoryCannotBeHardDeleted() throws Exception {
        TestData.Account instructor = data.instructor();
        data.pendingCourse(instructor);

        mvc.perform(delete("/api/admin/users/{id}", instructor.id()).with(csrf()).cookie(login(data.admin())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("USER_HAS_DEPENDENTS"));
    }

    @Test
    void accountsWithoutHistoryCanBeDeleted() throws Exception {
        TestData.Account student = data.student();
        Cookie admin = login(data.admin());
        login(student); // a live session must not block deletion

        mvc.perform(delete("/api/admin/users/{id}", student.id()).with(csrf()).cookie(admin))
                .andExpect(status().isNoContent());
    }

    @Test
    void onlyActiveAccountsCanBeSuspended() throws Exception {
        TestData.Account student = data.student();
        Cookie admin = login(data.admin());

        mvc.perform(post("/api/admin/users/{id}/suspend", student.id()).with(csrf()).cookie(admin))
                .andExpect(jsonPath("$.status").value("SUSPENDED"));
        mvc.perform(post("/api/admin/users/{id}/suspend", student.id()).with(csrf()).cookie(admin))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("INVALID_STATUS_TRANSITION"));
    }
}
