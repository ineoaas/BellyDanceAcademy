import { useMutation, useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";

export function usePublicStats() {
  return useQuery({ queryKey: ["stats"], queryFn: () => http.get("/stats"), staleTime: 5 * 60_000 });
}

/** null until someone has left a review with a comment. */
export function useFeaturedReview() {
  return useQuery({ queryKey: ["reviews", "featured"], queryFn: () => http.get("/reviews/featured"), staleTime: 5 * 60_000 });
}

export function useSendContactMessage() {
  return useMutation({ mutationFn: (message) => http.post("/contact", message) });
}
