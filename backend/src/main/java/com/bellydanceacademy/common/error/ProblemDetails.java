package com.bellydanceacademy.common.error;

import java.util.Map;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;

/** Builds RFC 7807 bodies that always carry a {@code code} property. */
public final class ProblemDetails {

    public static final String CODE = "code";
    public static final String FIELD_ERRORS = "fieldErrors";

    private ProblemDetails() {
    }

    public static ProblemDetail of(HttpStatusCode status, String code, String detail) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setProperty(CODE, code);
        return problem;
    }

    public static ProblemDetail validation(String detail, Map<String, String> fieldErrors) {
        ProblemDetail problem = of(HttpStatusCode.valueOf(400), "VALIDATION_FAILED", detail);
        problem.setProperty(FIELD_ERRORS, fieldErrors);
        return problem;
    }
}
