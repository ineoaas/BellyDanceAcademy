import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";

export const instructorKeys = {
  all: ["instructors"],
  page: (slug) => ["instructors", slug],
};

export function useInstructors() {
  return useQuery({ queryKey: instructorKeys.all, queryFn: () => http.get("/instructors"), staleTime: 5 * 60_000 });
}

export function useInstructorPage(slug) {
  return useQuery({
    queryKey: instructorKeys.page(slug),
    queryFn: () => http.get(`/instructors/${encodeURIComponent(slug)}`),
  });
}
