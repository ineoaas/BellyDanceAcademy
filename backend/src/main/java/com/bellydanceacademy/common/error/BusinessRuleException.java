package com.bellydanceacademy.common.error;

import org.springframework.http.HttpStatus;

/** Well-formed input that a domain rule rejects (HTTP 422). */
public class BusinessRuleException extends ApiException {

    public BusinessRuleException(String code, String message) {
        super(HttpStatus.UNPROCESSABLE_CONTENT, code, message);
    }
}
