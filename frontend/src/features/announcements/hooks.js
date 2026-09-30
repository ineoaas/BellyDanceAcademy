import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";

export const announcementKeys = {
  active: ["announcements", "active"],
  all: ["announcements", "all"],
};

export function useActiveAnnouncements() {
  return useQuery({
    queryKey: announcementKeys.active,
    queryFn: () => http.get("/announcements"),
    staleTime: 5 * 60_000,
  });
}
