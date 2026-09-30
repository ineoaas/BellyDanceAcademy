import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SESSION_KEY } from "@/features/auth/hooks";
import { catalogKeys } from "@/features/catalog/hooks";
import { studentApi } from "./api";

export const studentKeys = {
  enrollments: ["me", "enrollments"],
  wishlist: ["me", "wishlist"],
};

/** @param pollWhile keep refetching every 2s while this returns true for the latest data */
export function useEnrollments({ pollWhile } = {}) {
  return useQuery({
    queryKey: studentKeys.enrollments,
    queryFn: studentApi.enrollments,
    staleTime: 0,
    refetchInterval: pollWhile ? (query) => (pollWhile(query.state.data) ? 2000 : false) : false,
  });
}

export function useWishlist() {
  return useQuery({ queryKey: studentKeys.wishlist, queryFn: studentApi.wishlist });
}

export function useSetWishlisted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, wishlisted }) =>
      wishlisted ? studentApi.addToWishlist(courseId) : studentApi.removeFromWishlist(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.wishlist });
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentApi.updateProfile,
    onSuccess: (user) => queryClient.setQueryData(SESSION_KEY, { user }),
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: studentApi.changePassword });
}
