package com.bellydanceacademy.common.text;

import java.text.Normalizer;
import java.util.Locale;
import java.util.function.Predicate;

/** URL slugs for courses and instructor profiles. */
public final class Slugs {

    private Slugs() {
    }

    /** "Leyla Marín — Veil Work!" → "leyla-marin-veil-work". */
    public static String slugify(String text) {
        String ascii = Normalizer.normalize(text, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
        return ascii.toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }

    /**
     * Slugifies {@code text}, appending -2, -3, … only when {@code isTaken}
     * reports a collision. Falls back to {@code fallback} for text with no
     * slug-able characters.
     */
    public static String unique(String text, String fallback, Predicate<String> isTaken) {
        String base = slugify(text);
        if (base.isEmpty()) {
            base = fallback;
        }
        String candidate = base;
        for (int suffix = 2; isTaken.test(candidate); suffix++) {
            candidate = base + "-" + suffix;
        }
        return candidate;
    }
}
