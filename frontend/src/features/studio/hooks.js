import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { catalogKeys } from "@/features/catalog/hooks";
import { instructorKeys } from "@/features/instructors/hooks";
import { studioApi } from "./api";

export const studioKeys = {
  dashboard: ["studio", "dashboard"],
  profile: ["studio", "profile"],
  course: (courseId) => ["studio", "course", String(courseId)],
  lessons: (courseId) => ["studio", "lessons", String(courseId)],
};

const IN_FLIGHT = new Set(["UPLOADING", "PROCESSING"]);

export function useStudioDashboard() {
  return useQuery({ queryKey: studioKeys.dashboard, queryFn: studioApi.dashboard });
}

/** Sends the instructor into Stripe's hosted onboarding. */
export function useStripeOnboarding() {
  return useMutation({
    mutationFn: studioApi.stripeOnboardingLink,
    onSuccess: ({ url }) => window.location.assign(url),
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studioApi.requestPayout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studioKeys.dashboard }),
  });
}

/** null until the instructor saves a profile for the first time. */
export function useInstructorProfile() {
  return useQuery({ queryKey: studioKeys.profile, queryFn: studioApi.profile });
}

export function useSaveInstructorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studioApi.saveProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(studioKeys.profile, profile);
      queryClient.invalidateQueries({ queryKey: instructorKeys.all });
    },
  });
}

export function useStudioCourse(courseId) {
  return useQuery({ queryKey: studioKeys.course(courseId), queryFn: () => studioApi.course(courseId) });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studioApi.createCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studioKeys.dashboard }),
  });
}

export function useUpdateCourse(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (course) => studioApi.updateCourse(courseId, course),
    onSuccess: (course) => {
      queryClient.setQueryData(studioKeys.course(courseId), course);
      queryClient.invalidateQueries({ queryKey: studioKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
    },
  });
}

/** Polls while any video is uploading or processing, so "ready" appears on its own. */
export function useStudioLessons(courseId) {
  return useQuery({
    queryKey: studioKeys.lessons(courseId),
    queryFn: () => studioApi.lessons(courseId),
    refetchInterval: (query) => (query.state.data?.some((lesson) => IN_FLIGHT.has(lesson.videoStatus)) ? 5000 : false),
  });
}

export function useAddLesson(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lesson) => studioApi.addLesson(courseId, lesson),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studioKeys.lessons(courseId) }),
  });
}

export function useMoveLesson(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, direction }) => studioApi.moveLesson(lessonId, direction),
    onSuccess: (lessons) => queryClient.setQueryData(studioKeys.lessons(courseId), lessons),
  });
}
