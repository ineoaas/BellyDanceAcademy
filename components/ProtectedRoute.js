"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

/**
 * Wrap a dashboard page with this to enforce role-based access.
 * requiredRole: "student" | "instructor"
 */
export default function ProtectedRoute({ requiredRole, children }) {
  const { session, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;

    if (!session) {
      router.replace(`/login?as=${requiredRole}&redirected=1`);
      return;
    }

    if (session.role !== requiredRole) {
      // Logged in, but as the wrong role — send them to the dashboard they DO have.
      if (session.role === "instructor") {
        router.replace("/instructor");
      } else {
        router.replace("/student");
      }
    }
  }, [ready, session, requiredRole, router]);

  const isAllowed = ready && session && session.role === requiredRole;

  if (!isAllowed) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink/50 text-sm">
        Checking your session…
      </div>
    );
  }

  return children;
}
