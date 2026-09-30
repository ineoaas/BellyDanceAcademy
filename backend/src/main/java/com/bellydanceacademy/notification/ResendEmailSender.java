package com.bellydanceacademy.notification;

import com.bellydanceacademy.common.error.ExternalServiceException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/** Delivers email through Resend's HTTP API. */
class ResendEmailSender implements EmailSender {

    private final RestClient restClient;
    private final String from;

    ResendEmailSender(RestClient.Builder builder, MailProperties properties) {
        this.restClient = builder
                .baseUrl("https://api.resend.com")
                .defaultHeaders(headers -> headers.setBearerAuth(properties.resendApiKey()))
                .build();
        this.from = properties.from();
    }

    @Override
    public void send(EmailMessage message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("from", from);
        body.put("to", List.of(message.to()));
        body.put("subject", message.subject());
        body.put("html", message.html());
        if (message.replyTo() != null) {
            body.put("reply_to", message.replyTo());
        }
        try {
            restClient.post().uri("/emails").contentType(MediaType.APPLICATION_JSON).body(body).retrieve().toBodilessEntity();
        } catch (RestClientException e) {
            throw new ExternalServiceException("Email", e);
        }
    }
}
