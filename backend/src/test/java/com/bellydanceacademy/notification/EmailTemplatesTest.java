package com.bellydanceacademy.notification;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class EmailTemplatesTest {

    @Test
    void escapesUserSuppliedTextInContactMessages() {
        EmailMessage message = EmailTemplates.contactMessage("admin@example.com",
                "<script>x</script>", "a@example.com", "<img src=x onerror=alert(1)>");

        assertThat(message.html())
                .doesNotContain("<script>")
                .doesNotContain("<img")
                .contains("&lt;script&gt;");
        assertThat(message.replyTo()).isEqualTo("a@example.com");
    }

    @Test
    void formatsReceiptAmounts() {
        assertThat(EmailTemplates.formatMoney(5900, "usd")).isEqualTo("$59.00");
        assertThat(EmailTemplates.formatMoney(1205, "eur")).isEqualTo("12.05 EUR");
    }
}
