import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderRoutes } from "@/test/render";
import { RequireRole } from "./RequireRole";

const routes = [
  { path: "/login", element: <p>login page</p> },
  { path: "/student", element: <p>student home</p> },
  {
    path: "/admin",
    element: <RequireRole role="ADMIN" />,
    children: [{ index: true, element: <p>admin area</p> }],
  },
];

describe("RequireRole", () => {
  it("sends guests to login, remembering where they were going", async () => {
    const { router } = renderRoutes(routes, { path: "/admin", user: null });

    expect(await screen.findByText("login page")).toBeInTheDocument();
    const params = new URLSearchParams(router.state.location.search);
    expect(params.get("as")).toBe("admin");
    expect(params.get("redirect")).toBe("/admin");
  });

  it("sends signed-in users with the wrong role to their own dashboard", async () => {
    renderRoutes(routes, { path: "/admin", user: { id: 1, name: "N", role: "STUDENT" } });

    expect(await screen.findByText("student home")).toBeInTheDocument();
  });

  it("lets the right role through", async () => {
    renderRoutes(routes, { path: "/admin", user: { id: 1, name: "A", role: "ADMIN" } });

    expect(await screen.findByText("admin area")).toBeInTheDocument();
  });
});
