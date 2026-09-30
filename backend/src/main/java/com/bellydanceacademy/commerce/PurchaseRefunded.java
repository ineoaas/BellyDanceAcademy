package com.bellydanceacademy.commerce;

/** Published after a refund commits — tells the student their access has ended. */
public record PurchaseRefunded(Long purchaseId, String studentName, String studentEmail, String courseTitle,
                               int amountCents, String currency) {
}
