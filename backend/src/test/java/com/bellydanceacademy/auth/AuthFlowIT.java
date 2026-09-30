package com.bellydanceacademy.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.bellydanceacademy.support.IntegrationTest;
import com.bellydanceacademy.support.TestData;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.event.ApplicationEvents;
import org.springframework.test.context.event.RecordApplicationEvents;

@RecordApplicationEvents
class AuthFlowIT extends IntegrationTest {

    @Autowired
    ApplicationEvents events;

    @Test
    void studentRegistrationSignsInImmediately() throws Exception {
        String email = "new-" + TestData.unique() + "@example.test";

        Cookie session = mvc.perform(json(post("/api/auth/register"),
                        "{\"name\":\"Nadia\",\"email\":\"%s\",\"password\":\"long-enough\"}".formatted(email)))
                .andExpect(status().isCreated())
                .andExpect(cookie().httpOnly("bda_session", true))
                .andExpect(jsonPath("$.user.role").value("STUDENT"))
                .andReturn().getResponse().getCookie("bda_session");

        mvc.perform(get("/api/auth/session").cookie(session))
                .andExpect(jsonPath("$.user.email").value(email));
    }

    @Test
    void stateChangingRequestsRequireCsrfToken() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"x@example.test\",\"password\":\"whatever\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void emailsAreUniqueCaseInsensitively() throws Exception {
        TestData.Account existing = data.student();

        mvc.perform(json(post("/api/auth/register"),
                        "{\"name\":\"Dup\",\"email\":\"%s\",\"password\":\"long-enough\"}".formatted(existing.email().toUpperCase())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_TAKEN"));
    }

    @Test
    void wrongPasswordAndUnknownEmailLookIdentical() throws Exception {
        TestData.Account student = data.student();

        mvc.perform(json(post("/api/auth/login"), "{\"email\":\"%s\",\"password\":\"wrong-password\"}".formatted(student.email())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
        mvc.perform(json(post("/api/auth/login"), "{\"email\":\"nobody@example.test\",\"password\":\"wrong-password\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    void instructorApplicantsCannotSignInUntilApproved() throws Exception {
        String email = "applicant-" + TestData.unique() + "@example.test";
        mvc.perform(json(post("/api/auth/instructor-applications"),
                        "{\"name\":\"Amara\",\"email\":\"%s\",\"password\":\"long-enough\"}".formatted(email)))
                .andExpect(status().isAccepted())
                .andExpect(cookie().doesNotExist("bda_session"));
        assertThat(events.stream(InstructorApplicationSubmitted.class)).anyMatch(e -> e.email().equals(email));

        mvc.perform(json(post("/api/auth/login"), "{\"email\":\"%s\",\"password\":\"long-enough\"}".formatted(email)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("ACCOUNT_PENDING"));

        Long applicantId = events.stream(InstructorApplicationSubmitted.class)
                .filter(e -> e.email().equals(email)).findFirst().orElseThrow().userId();
        mvc.perform(post("/api/admin/instructor-applications/{id}/approve", applicantId)
                        .with(csrf())
                        .cookie(login(data.admin())))
                .andExpect(status().isNoContent());

        assertThat(login(email, "long-enough")).isNotNull();
    }

    @Test
    void suspendingAUserEndsTheirExistingSession() throws Exception {
        TestData.Account student = data.student();
        Cookie studentSession = login(student);

        mvc.perform(post("/api/admin/users/{id}/suspend", student.id())
                        .with(csrf())
                        .cookie(login(data.admin())))
                .andExpect(status().isOk());

        mvc.perform(get("/api/auth/session").cookie(studentSession))
                .andExpect(jsonPath("$.user").doesNotExist());
    }

    @Test
    void passwordResetLinkWorksExactlyOnce() throws Exception {
        TestData.Account student = data.student();
        mvc.perform(json(post("/api/auth/password-reset"), "{\"email\":\"%s\"}".formatted(student.email())))
                .andExpect(status().isAccepted());
        String token = events.stream(PasswordResetRequested.class)
                .filter(e -> e.email().equals(student.email())).findFirst().orElseThrow().rawToken();

        String confirm = "{\"token\":\"%s\",\"password\":\"brand-new-password\"}".formatted(token);
        mvc.perform(json(post("/api/auth/password-reset/confirm"), confirm))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("bda_session"));
        mvc.perform(json(post("/api/auth/password-reset/confirm"), confirm))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("RESET_TOKEN_INVALID"));

        assertThat(login(student.email(), "brand-new-password")).isNotNull();
    }

    @Test
    void unknownEmailResetRequestLooksTheSame() throws Exception {
        mvc.perform(json(post("/api/auth/password-reset"), "{\"email\":\"ghost@example.test\"}"))
                .andExpect(status().isAccepted());
    }
}
