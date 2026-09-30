import { Navigate, Outlet, useLocation } from "react-router";
import { LoadingState } from "@/components/ui";
import { DASHBOARD_PATH } from "@/lib/labels";
import { useSession } from "./hooks";

/**
 * Route guard. This is UX only — the API enforces every rule itself — but
 * it sends people to the right place instead of showing them 403s.
 */
export function RequireRole({ role }) {
  const { data: user, isPending } = useSession();
  const location = useLocation();

  if (isPending) return <LoadingState />;

  if (!user) {
    const params = new URLSearchParams({
      as: role.toLowerCase(),
      redirected: "1",
      redirect: location.pathname + location.search,
    });
    return <Navigate to={`/login?${params}`} replace />;
  }

  if (user.role !== role) return <Navigate to={DASHBOARD_PATH[user.role]} replace />;

  return <Outlet />;
}
