import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Alert, Button, ErrorAlert, TextField } from "@/components/ui";
import { formValues } from "@/lib/forms";
import { DASHBOARD_PATH } from "@/lib/labels";
import { AuthCard } from "../components/AuthCard";
import { useConfirmPasswordReset } from "../hooks";
import { MIN_PASSWORD_LENGTH, passwordPairError } from "../passwords";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const confirmReset = useConfirmPasswordReset();
  const [localError, setLocalError] = useState(null);
  const token = params.get("token") ?? "";

  function handleSubmit(event) {
    event.preventDefault();
    const values = formValues(event.currentTarget);
    const problem = passwordPairError(values);
    setLocalError(problem);
    if (problem) return;
    confirmReset.mutate(
      { token, password: values.password },
      { onSuccess: ({ user }) => navigate(user ? DASHBOARD_PATH[user.role] : "/login", { replace: true }) },
    );
  }

  if (!token) {
    return (
      <AuthCard title="Set a new password">
        <Alert tone="error">
          That reset link is incomplete.{" "}
          <Link to="/forgot-password" className="underline">
            Request a new one
          </Link>
          .
        </Alert>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert tone="error">{localError}</Alert>
        <ErrorAlert error={confirmReset.error} />
        <TextField
          label="New Password"
          name="password"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
        />
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
        />
        <Button type="submit" className="mt-2 w-full" disabled={confirmReset.isPending}>
          Set New Password
        </Button>
      </form>
    </AuthCard>
  );
}
