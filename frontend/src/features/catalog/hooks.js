import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { catalogApi } from "./api";

export const catalogKeys = {
  all: ["courses"],
  search: (filters) => ["courses", "search", filters],
  styles: ["courses", "styles"],
  detail: (slug) => ["courses", "detail", slug],
  reviews: (slug) => ["courses", "reviews", slug],
};

export function useCourseSearch(filters = {}) {
  return useQuery({
    queryKey: catalogKeys.search(filters),
    queryFn: () => catalogApi.search(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCourseStyles() {
  return useQuery({ queryKey: catalogKeys.styles, queryFn: catalogApi.styles, staleTime: 5 * 60_000 });
}

export function useCourse(slug) {
  return useQuery({ queryKey: catalogKeys.detail(slug), queryFn: () => catalogApi.detail(slug) });
}

export function useCourseReviews(slug) {
  return useQuery({ queryKey: catalogKeys.reviews(slug), queryFn: () => catalogApi.reviews(slug) });
}

export function useSubmitReview(slug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (review) => catalogApi.submitReview(slug, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.detail(slug) });
      queryClient.invalidateQueries({ queryKey: catalogKeys.reviews(slug) });
    },
  });
}

/** Hands the browser off to the payment provider's hosted checkout. */
export function useStartCheckout(slug) {
  return useMutation({
    mutationFn: () => catalogApi.startCheckout(slug),
    onSuccess: ({ checkoutUrl }) => window.location.assign(checkoutUrl),
  });
}
