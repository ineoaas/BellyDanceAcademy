import { QueryCache, QueryClient } from "@tanstack/react-query";
import { SESSION_KEY } from "@/features/auth/hooks";

/**
 * One client for the app. A 401 from any query means the session ended
 * (expired, or the account was suspended) — clearing the cached user lets
 * the route guards send the person to the login page.
 */
export function createQueryClient() {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (error.status === 401 && query.queryKey[0] !== SESSION_KEY[0]) {
          queryClient.setQueryData(SESSION_KEY, { user: null });
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Client errors won't fix themselves on retry; network blips might.
        retry: (failureCount, error) => failureCount < 2 && (error.status === 0 || error.status >= 500),
      },
    },
  });
  return queryClient;
}
