package com.bellydanceacademy.course;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.Objects;

/** Request body shared by create and edit. Money is in cents. */
record CourseForm(
        @NotBlank(message = "Please give the course a title.") @Size(max = 150) String title,
        @Size(max = 300) String description,
        @Size(max = 10_000) String about,
        @NotNull(message = "Choose a level.") CourseLevel level,
        @Size(max = 60) String style,
        @NotNull(message = "Please set a price.") @Positive(message = "Price must be more than zero.")
        @Max(value = 100_000_00, message = "Price is too high.") Integer priceCents,
        @Positive(message = "The \"was\" price must be more than zero.") Integer originalPriceCents,
        @Size(max = 40) String durationLabel) {

    CourseDetails toDetails() {
        return new CourseDetails(title, orEmpty(description), orEmpty(about), level, orEmpty(style), priceCents,
                originalPriceCents, orEmpty(durationLabel));
    }

    private static String orEmpty(String value) {
        return Objects.requireNonNullElse(value, "");
    }
}
