import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderRoutes, stubFetch } from "@/test/render";
import LoginPage from "./LoginPage";

const routes = [
  { path: "/login", element: <LoginPage /> },
  { path: "/student", element: <p>student home</p> },
  { path: "/courses/:slug", element: <p>course page</p> },
];

async function logIn(email, password) {
  await userEvent.type(screen.getByLabelText("Email"), email);
  await userEvent.type(screen.getByLabelText("Password"), password);
  await userEvent.click(screen.getByRole("button", { name: "Log In" }));
}

describe("LoginPage", () => {
  it("shows the server's message when sign-in fails", async () => {
    document.cookie = "XSRF-TOKEN=t; path=/";
    stubFetch({
      "POST /api/auth/login": {
        status: 401,
        body: { code: "INVALID_CREDENTIALS", detail: "That email and password don't match an account." },
      },
    });
    renderRoutes(routes, { path: "/login", user: null });

    await logIn("nadia@example.com", "wrong-password");

    expect(await screen.findByRole("alert")).toHaveTextContent("don't match an account");
  });

  it("returns to the page the user came from after signing in", async () => {
    document.cookie = "XSRF-TOKEN=t; path=/";
    stubFetch({
      "POST /api/auth/login": { body: { user: { id: 1, name: "Nadia", role: "STUDENT" } } },
    });
    renderRoutes(routes, { path: "/login?redirect=/courses/baladi", user: null });

    await logIn("nadia@example.com", "student123");

    expect(await screen.findByText("course page")).toBeInTheDocument();
  });

  it("ignores off-site redirect targets", async () => {
    document.cookie = "XSRF-TOKEN=t; path=/";
    stubFetch({
      "POST /api/auth/login": { body: { user: { id: 1, name: "Nadia", role: "STUDENT" } } },
    });
    renderRoutes(routes, { path: "/login?redirect=//evil.example", user: null });

    await logIn("nadia@example.com", "student123");

    expect(await screen.findByText("student home")).toBeInTheDocument();
  });

  it("checks that passwords match before calling the server", async () => {
    const fetchMock = stubFetch({});
    renderRoutes(routes, { path: "/login?mode=signup", user: null });

    await userEvent.type(screen.getByLabelText("Name"), "Nadia");
    await userEvent.type(screen.getByLabelText("Email"), "nadia@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "long-enough");
    await userEvent.type(screen.getByLabelText("Confirm Password"), "different!");
    await userEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Passwords don't match.");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
