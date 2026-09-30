import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./api";

export const SESSION_KEY = ["session"];

/** The signed-in user, or null. Fetched once and kept until sign-in/out changes it. */
export function useSession() {
  return useQuery({
    queryKey: SESSION_KEY,
    queryFn: authApi.session,
    staleTime: Infinity,
    select: (session) => session.user,
  });
}

/** For components rendered behind <RequireRole>, where a user is guaranteed. */
export function useCurrentUser() {
  return useSession().data;
}

/**
 * Any call that starts a session: stores the new user and refetches
 * everything else, since most data depends on who's looking.
 */
function useSignIn(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (session) => {
      queryClient.setQueryData(SESSION_KEY, session);
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] !== SESSION_KEY[0] });
    },
  });
}

export const useLogin = () => useSignIn(authApi.login);
export const useRegisterStudent = () => useSignIn(authApi.registerStudent);
export const useConfirmPasswordReset = () => useSignIn(authApi.confirmPasswordReset);

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      queryClient.setQueryData(SESSION_KEY, { user: null });
    },
  });
}

export const useApplyAsInstructor = () => useMutation({ mutationFn: authApi.applyAsInstructor });
export const useRequestPasswordReset = () => useMutation({ mutationFn: authApi.requestPasswordReset });
