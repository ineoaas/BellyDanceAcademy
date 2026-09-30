package com.bellydanceacademy.notification;

import java.math.BigDecimal;
import java.util.Locale;
import org.springframework.web.util.HtmlUtils;

/**
 * Every transactional email. All user-supplied text is HTML-escaped —
 * names and messages come straight from public forms.
 */
final class EmailTemplates {

    private EmailTemplates() {
    }

    static EmailMessage passwordReset(String to, String resetUrl) {
        return new EmailMessage(to, "Reset your Belly Dance Academy password", """
                <p>Someone requested a password reset for this account.</p>
                <p><a href="%s">Click here to set a new password</a>. This link expires in 1 hour.</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
                """.formatted(escape(resetUrl)));
    }

    static EmailMessage instructorApplication(String adminEmail, String applicantName, String applicantEmail,
                                              String reviewUrl) {
        return new EmailMessage(adminEmail, "New instructor application", """
                <p><strong>%s</strong> (%s) applied to teach on Belly Dance Academy.</p>
                <p>Their account stays pending until you approve it: <a href="%s">review applications</a>.</p>
                """.formatted(escape(applicantName), escape(applicantEmail), escape(reviewUrl)));
    }

    static EmailMessage contactMessage(String adminEmail, String name, String email, String message) {
        return new EmailMessage(adminEmail, "Contact form: " + name, """
                <p><strong>%s</strong> (%s) sent a message through the Contact page:</p>
                <p style="white-space: pre-wrap">%s</p>
                """.formatted(escape(name), escape(email), escape(message)), email);
    }

    static EmailMessage purchaseReceipt(String to, String studentName, String courseTitle, int amountCents,
                                        String currency, String dashboardUrl) {
        return new EmailMessage(to, "Your receipt for " + courseTitle, """
                <p>Thanks for your purchase, %s!</p>
                <p><strong>%s</strong> — %s</p>
                <p>It's available in your dashboard now: <a href="%s">view your courses</a>.</p>
                """.formatted(escape(studentName), escape(courseTitle), formatMoney(amountCents, currency),
                escape(dashboardUrl)));
    }

    static String formatMoney(int amountCents, String currency) {
        String amount = BigDecimal.valueOf(amountCents, 2).toPlainString();
        return "usd".equalsIgnoreCase(currency) ? "$" + amount : amount + " " + currency.toUpperCase(Locale.ROOT);
    }

    private static String escape(String text) {
        return HtmlUtils.htmlEscape(text);
    }
}
