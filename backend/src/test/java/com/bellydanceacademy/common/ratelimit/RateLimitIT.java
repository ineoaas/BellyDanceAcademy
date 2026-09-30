package com.bellydanceacademy.common.ratelimit;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.bellydanceacademy.support.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@TestPropertySource(properties = "app.rate-limit.enabled=true")
class RateLimitIT extends IntegrationTest {

    private static final String CONTACT = "{\"name\":\"Nadia\",\"email\":\"nadia@example.test\",\"message\":\"Hello\"}";

    @Test
    void rejectsRequestsOverTheLimitWithRetryAfter() throws Exception {
        for (int i = 0; i < 5; i++) {
            mvc.perform(from("10.0.0.1", json(post("/api/contact"), CONTACT)))
                    .andExpect(status().isAccepted());
        }

        mvc.perform(from("10.0.0.1", json(post("/api/contact"), CONTACT)))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.code").value("RATE_LIMITED"));

        mvc.perform(from("10.0.0.2", json(post("/api/contact"), CONTACT)))
                .andExpect(status().isAccepted());
    }

    @Test
    void leavesOtherRequestsAlone() throws Exception {
        for (int i = 0; i < 30; i++) {
            mvc.perform(from("10.0.0.3", get("/api/auth/session")))
                    .andExpect(status().isOk());
        }
    }

    private static MockHttpServletRequestBuilder from(String ip, MockHttpServletRequestBuilder request) {
        return request.with(r -> {
            r.setRemoteAddr(ip);
            return r;
        });
    }
}
