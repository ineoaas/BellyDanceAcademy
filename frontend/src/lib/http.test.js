import { describe, expect, it } from "vitest";
import { stubFetch } from "@/test/render";
import { ApiError, http, toQueryString } from "./http";

describe("http", () => {
  it("sends the CSRF cookie back as a header on writes", async () => {
    document.cookie = "XSRF-TOKEN=abc123; path=/";
    const fetchMock = stubFetch({ "POST /api/contact": { status: 204 } });

    await http.post("/contact", { name: "N" });

    expect(fetchMock.mock.calls[0][1].headers["X-XSRF-TOKEN"]).toBe("abc123");
  });

  it("primes the CSRF cookie before the first write", async () => {
    const fetchMock = stubFetch({
      "GET /api/auth/session": () => {
        document.cookie = "XSRF-TOKEN=fresh; path=/";
        return { body: { user: null } };
      },
      "POST /api/auth/logout": { status: 204 },
    });

    await http.post("/auth/logout");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].headers["X-XSRF-TOKEN"]).toBe("fresh");
  });

  it("turns problem responses into ApiError with the server's code and field errors", async () => {
    stubFetch({
      "GET /api/courses/missing": {
        status: 404,
        body: { detail: "Course not found.", code: "NOT_FOUND" },
      },
    });

    const error = await http.get("/courses/missing").catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, code: "NOT_FOUND", message: "Course not found." });
  });

  it("builds query strings without empty values", () => {
    expect(toQueryString({ q: "veil", level: "", sort: undefined, minPriceCents: 0 })).toBe(
      "?q=veil&minPriceCents=0",
    );
    expect(toQueryString({})).toBe("");
  });
});
