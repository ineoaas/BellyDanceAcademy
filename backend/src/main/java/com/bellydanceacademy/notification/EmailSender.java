package com.bellydanceacademy.notification;

public interface EmailSender {

    /** @throws com.bellydanceacademy.common.error.ExternalServiceException if delivery fails */
    void send(EmailMessage message);
}
