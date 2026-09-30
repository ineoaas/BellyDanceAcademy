package com.bellydanceacademy.notification;

/** @param replyTo optional */
public record EmailMessage(String to, String subject, String html, String replyTo) {

    public EmailMessage(String to, String subject, String html) {
        this(to, subject, html, null);
    }
}
