import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { SESSION_KEY } from "@/features/auth/hooks";

/**
 * Renders routes inside a fresh query client and in-memory router.
 * Pass `user` to start signed in (or null for a guest).
 */
export function renderRoutes(routes, { path = "/", user } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  if (user !== undefined) queryClient.setQueryData(SESSION_KEY, { user });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return {
    router,
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    ),
  };
}

/** A fetch stub that answers by "METHOD /path". */
export function stubFetch(routes) {
  const fetchMock = vi.fn(async (url, init = {}) => {
    const key = `${init.method ?? "GET"} ${url}`;
    const handler = routes[key];
    if (!handler) throw new Error(`Unexpected request: ${key}`);
    const { status = 200, body } = typeof handler === "function" ? handler(init) : handler;
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": status >= 400 ? "application/problem+json" : "application/json" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
