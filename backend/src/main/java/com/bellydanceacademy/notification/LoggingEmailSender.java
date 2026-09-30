package com.bellydanceacademy.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Local-development stand-in: logs the email (links included) instead of sending it. */
class LoggingEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(LoggingEmailSender.class);

    @Override
    public void send(EmailMessage message) {
        log.info("""
                [email not sent — RESEND_API_KEY is not set]
                  to:      {}
                  subject: {}
                  body:    {}""", message.to(), message.subject(), message.html());
    }
}
