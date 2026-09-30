import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./redirects";

describe("safeRedirectPath", () => {
  it("allows same-site paths", () => {
    expect(safeRedirectPath("/courses/baladi?tab=reviews")).toBe("/courses/baladi?tab=reviews");
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", null])(
    "rejects %s",
    (candidate) => {
      expect(safeRedirectPath(candidate, "/student")).toBe("/student");
    },
  );
});
