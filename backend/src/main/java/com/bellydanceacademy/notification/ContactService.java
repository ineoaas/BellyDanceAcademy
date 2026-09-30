package com.bellydanceacademy.notification;

import com.bellydanceacademy.config.AppProperties;
import org.springframework.stereotype.Service;

/** Delivers Contact-page messages to the admin inbox, with reply-to set to the sender. */
@Service
public class ContactService {

    private final EmailSender emailSender;
    private final AppProperties appProperties;

    ContactService(EmailSender emailSender, AppProperties appProperties) {
        this.emailSender = emailSender;
        this.appProperties = appProperties;
    }

    /** Sent synchronously so the sender learns if delivery failed. */
    public void send(String name, String email, String message) {
        emailSender.send(EmailTemplates.contactMessage(appProperties.adminEmail(), name.trim(), email.trim(),
                message.trim()));
    }
}
