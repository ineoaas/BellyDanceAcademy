import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentKeys } from "@/features/student/hooks";
import { learningApi } from "./api";

export function useLesson(slug, lessonId) {
  return useQuery({
    queryKey: ["watch", slug, lessonId],
    queryFn: () => learningApi.watch(slug, lessonId),
    // Signed playback tokens are short-lived; never serve a stale one.
    staleTime: 0,
    gcTime: 0,
  });
}

export function useReportProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, positionSeconds }) => learningApi.reportProgress(lessonId, positionSeconds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studentKeys.enrollments }),
  });
}
