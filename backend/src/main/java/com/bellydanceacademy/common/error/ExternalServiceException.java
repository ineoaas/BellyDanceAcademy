package com.bellydanceacademy.common.error;

import org.springframework.http.HttpStatus;

/** A third-party dependency (Stripe, Mux, Resend) failed or isn't configured. */
public class ExternalServiceException extends ApiException {

    public ExternalServiceException(String service, Throwable cause) {
        super(HttpStatus.BAD_GATEWAY, "EXTERNAL_SERVICE_ERROR",
                service + " is unavailable right now. Please try again shortly.");
        initCause(cause);
    }
}
