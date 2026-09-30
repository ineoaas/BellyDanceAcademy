package com.bellydanceacademy.commerce;

/** Published after a new purchase commits — triggers the receipt email. */
public record PurchaseCompleted(Long purchaseId, String studentName, String studentEmail, String courseTitle,
                                int amountCents, String currency) {
}
