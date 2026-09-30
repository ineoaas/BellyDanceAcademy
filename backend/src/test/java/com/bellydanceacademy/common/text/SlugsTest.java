package com.bellydanceacademy.common.text;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import org.junit.jupiter.api.Test;

class SlugsTest {

    @Test
    void slugifiesAndStripsAccents() {
        assertThat(Slugs.slugify("  Leyla Marín — Veil Work! ")).isEqualTo("leyla-marin-veil-work");
        assertThat(Slugs.slugify("Saidi & the Cane Dance")).isEqualTo("saidi-the-cane-dance");
    }

    @Test
    void appendsSuffixOnlyOnCollision() {
        Set<String> taken = Set.of("drum-solo", "drum-solo-2");

        assertThat(Slugs.unique("Veil Work", "course", taken::contains)).isEqualTo("veil-work");
        assertThat(Slugs.unique("Drum Solo", "course", taken::contains)).isEqualTo("drum-solo-3");
    }

    @Test
    void fallsBackWhenNothingIsSluggable() {
        assertThat(Slugs.unique("!!!", "course", slug -> false)).isEqualTo("course");
    }
}
