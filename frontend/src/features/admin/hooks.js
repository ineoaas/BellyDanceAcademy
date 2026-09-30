import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { announcementKeys } from "@/features/announcements/hooks";
import { adminApi } from "./api";

export const adminKeys = {
  all: ["admin"],
  overview: ["admin", "overview"],
  applications: ["admin", "applications"],
  pendingCourses: ["admin", "courses", "pending"],
  reviews: ["admin", "reviews"],
  users: ["admin", "users"],
  commission: ["admin", "commission"],
  payouts: ["admin", "payouts"],
};

export const useAdminOverview = () => useQuery({ queryKey: adminKeys.overview, queryFn: adminApi.overview });
export const useApplications = () => useQuery({ queryKey: adminKeys.applications, queryFn: adminApi.applications });
export const usePendingCourses = () => useQuery({ queryKey: adminKeys.pendingCourses, queryFn: adminApi.pendingCourses });
export const useModeratedReviews = () => useQuery({ queryKey: adminKeys.reviews, queryFn: adminApi.reviews });
export const useUsers = () => useQuery({ queryKey: adminKeys.users, queryFn: adminApi.users });
export const useCommission = () => useQuery({ queryKey: adminKeys.commission, queryFn: adminApi.commission });
export const usePayoutLedger = () => useQuery({ queryKey: adminKeys.payouts, queryFn: adminApi.payouts });
export const useAllAnnouncements = () => useQuery({ queryKey: announcementKeys.all, queryFn: adminApi.announcements });

/**
 * Admin actions ripple across the site (badges, catalog, banner), so every
 * one refreshes all admin data plus anything public it can affect.
 */
export function useAdminAction(mutationFn, { alsoInvalidate = [] } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      alsoInvalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
  });
}
