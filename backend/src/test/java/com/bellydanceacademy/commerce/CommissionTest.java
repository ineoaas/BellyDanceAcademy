package com.bellydanceacademy.commerce;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class CommissionTest {

    @ParameterizedTest(name = "{0}¢ at {1}% → platform {2}¢")
    @CsvSource({
            "5900, 20, 1180",
            "4999, 20, 1000",   // 999.8 rounds up
            "4997, 20, 999",    // 999.4 rounds down
            "1, 50, 1",         // exact half rounds up
            "12000, 0, 0",
            "12000, 100, 12000"
    })
    void roundsPlatformShareToNearestCent(int price, int rate, int expectedPlatform) {
        Commission split = Commission.split(price, rate);

        assertThat(split.platformCents()).isEqualTo(expectedPlatform);
        assertThat(split.platformCents() + split.instructorCents()).isEqualTo(price);
    }

    @Test
    void rejectsOutOfRangeRates() {
        assertThatIllegalArgumentException().isThrownBy(() -> Commission.split(1000, 101));
        assertThatIllegalArgumentException().isThrownBy(() -> Commission.split(1000, -1));
    }
}
