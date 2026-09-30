import { Link } from "react-router";
import { Alert, Button, ErrorAlert, TextField } from "@/components/ui";
import { formValues } from "@/lib/forms";
import { AuthCard } from "../components/AuthCard";
import { useRequestPasswordReset } from "../hooks";

export default function ForgotPasswordPage() {
  const requestReset = useRequestPasswordReset();

  function handleSubmit(event) {
    event.preventDefault();
    requestReset.mutate(formValues(event.currentTarget).email);
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the email on your account and we'll send you a link to set a new password."
    >
      {requestReset.isSuccess ? (
        <Alert tone="info">If that email has an account, a reset link is on its way. Check your inbox.</Alert>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ErrorAlert error={requestReset.error} />
          <TextField
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Button type="submit" className="mt-2 w-full" disabled={requestReset.isPending}>
            Send Reset Link
          </Button>
        </form>
      )}
      <p className="mt-5 text-center text-sm text-ink/60">
        <Link to="/login" className="font-medium text-burgundy">
          Back to login
        </Link>
      </p>
    </AuthCard>
  );
}
