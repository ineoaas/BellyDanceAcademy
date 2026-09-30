package com.bellydanceacademy.notification;

import com.bellydanceacademy.auth.InstructorApplicationSubmitted;
import com.bellydanceacademy.auth.PasswordResetRequested;
import com.bellydanceacademy.commerce.PurchaseCompleted;
import com.bellydanceacademy.config.AppProperties;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Sends emails in reaction to domain events — only after the triggering
 * transaction commits (never for rolled-back work) and off the request
 * thread (a slow mail API never slows a checkout webhook or a sign-up).
 */
@Component
class NotificationListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationListener.class);

    private final EmailSender emailSender;
    private final AppProperties appProperties;

    NotificationListener(EmailSender emailSender, AppProperties appProperties) {
        this.emailSender = emailSender;
        this.appProperties = appProperties;
    }

    @Async
    @TransactionalEventListener
    void on(InstructorApplicationSubmitted event) {
        send(EmailTemplates.instructorApplication(appProperties.adminEmail(), event.name(), event.email(),
                appProperties.frontendLink("/admin/applications")), event);
    }

    @Async
    @TransactionalEventListener
    void on(PasswordResetRequested event) {
        String link = appProperties.frontendLink(
                "/reset-password?token=" + URLEncoder.encode(event.rawToken(), StandardCharsets.UTF_8));
        send(EmailTemplates.passwordReset(event.email(), link), event);
    }

    @Async
    @TransactionalEventListener
    void on(PurchaseCompleted event) {
        send(EmailTemplates.purchaseReceipt(event.studentEmail(), event.studentName(), event.courseTitle(),
                event.amountCents(), event.currency(), appProperties.frontendLink("/student")), event);
    }

    private void send(EmailMessage message, Object cause) {
        try {
            emailSender.send(message);
        } catch (RuntimeException e) {
            log.error("Failed to send '{}' email for {}", message.subject(), cause, e);
        }
    }
}
