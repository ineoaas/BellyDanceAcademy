import { describe, expect, it } from "vitest";
import { dollarsToCents, formatDuration, formatMoney, formatPrice, pluralize, stars } from "./format";

describe("format", () => {
  it("formats ledger amounts with cents and shop prices without trailing zeros", () => {
    expect(formatMoney(118000)).toBe("$1,180.00");
    expect(formatPrice(5900)).toBe("$59");
    expect(formatPrice(5950)).toBe("$59.50");
  });

  it("formats lesson durations", () => {
    expect(formatDuration(760)).toBe("12:40");
    expect(formatDuration(3725)).toBe("1:02:05");
    expect(formatDuration(null)).toBe("");
  });

  it("renders whole stars only", () => {
    expect(stars(4.4)).toBe("★★★★☆");
    expect(stars(4.6)).toBe("★★★★★");
  });

  it("converts form dollars to integer cents", () => {
    expect(dollarsToCents("12.5")).toBe(1250);
    expect(dollarsToCents("0.1")).toBe(10);
    expect(dollarsToCents("")).toBeNull();
  });

  it("pluralizes", () => {
    expect(pluralize(1, "lesson")).toBe("1 lesson");
    expect(pluralize(3, "lesson")).toBe("3 lessons");
  });
});
