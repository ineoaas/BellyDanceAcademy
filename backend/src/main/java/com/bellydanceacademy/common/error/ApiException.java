package com.bellydanceacademy.common.error;

import org.springframework.http.HttpStatus;

/**
 * Base type for every expected, user-facing failure. The {@code code} is a
 * stable machine-readable identifier the frontend can branch on; the
 * message is safe to show to the user as-is.
 */
public abstract class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    protected ApiException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus status() {
        return status;
    }

    public String code() {
        return code;
    }
}
