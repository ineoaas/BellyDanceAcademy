"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import { requestPasswordResetAction } from "@/lib/actions/passwordReset";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const wasSent = searchParams.get("sent") === "1";

  return (
    <main className="flex-1 bg-burgundy-deep flex items-center justify-center px-5 py-12">
      <div className="bg-ivory w-full max-w-sm p-9 relative">
        <h1 className="font-display text-xl mb-1">Reset your password</h1>
        <p className="text-sm text-ink/60 mb-6">
          Enter the email on your account and we&rsquo;ll send you a link to set a new password.
        </p>

        {wasSent ? (
          <p className="text-sm text-ink/70 bg-gold/15 border border-gold/40 px-3 py-3">
            If that email has an account, a reset link is on its way. Check your inbox.
          </p>
        ) : (
          <form action={requestPasswordResetAction}>
            <Field label="Email">
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full border border-burgundy/20 px-3 py-3 text-sm"
              />
            </Field>
            <Button type="submit" variant="primary" className="w-full mt-2">
              Send Reset Link
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-ink/60 mt-5">
          <a href="/login" className="text-burgundy font-medium">Back to login</a>
        </p>
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
