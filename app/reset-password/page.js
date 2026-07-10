"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import { resetPasswordAction } from "@/lib/actions/passwordReset";

const ERROR_MESSAGES = {
  invalid: "That reset link is invalid or has expired. Request a new one.",
  short: "Password must be at least 8 characters.",
  mismatch: "Passwords don't match.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const errorKey = searchParams.get("error");
  const errorMessage = errorKey ? ERROR_MESSAGES[errorKey] : null;

  return (
    <main className="flex-1 bg-burgundy-deep flex items-center justify-center px-5 py-12">
      <div className="bg-ivory w-full max-w-sm p-9 relative">
        <h1 className="font-display text-xl mb-1">Set a new password</h1>
        <p className="text-sm text-ink/60 mb-6">Choose a new password for your account.</p>

        {errorMessage && (
          <p className="text-xs text-burgundy bg-gold/15 border border-gold/40 px-3 py-2 mb-5">
            {errorMessage}
          </p>
        )}

        <form action={resetPasswordAction}>
          <input type="hidden" name="token" value={token} />
          <Field label="New Password">
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full border border-burgundy/20 px-3 py-3 text-sm"
            />
          </Field>
          <Field label="Confirm Password">
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full border border-burgundy/20 px-3 py-3 text-sm"
            />
          </Field>
          <Button type="submit" variant="primary" className="w-full mt-2">
            Set New Password
          </Button>
        </form>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-[0.65rem] font-semibold uppercase tracking-widest text-ink/55 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
