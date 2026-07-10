"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import { loginAction, registerAction } from "@/lib/actions/auth";

const LOGIN_ERRORS = {
  1: "That email and password don’t match an account.",
};

const SIGNUP_ERRORS = {
  missing: "Please fill in your name and email.",
  short: "Password must be at least 8 characters.",
  mismatch: "Passwords don't match.",
  exists: "An account with that email already exists — try logging in instead.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();

  let initialRole = "student";
  if (searchParams.get("as") === "instructor") {
    initialRole = "instructor";
  }
  let initialMode = "login";
  if (searchParams.get("mode") === "signup") {
    initialMode = "signup";
  }
  const redirectTo = searchParams.get("redirect") ?? "";
  const wasRedirected = searchParams.get("redirected") === "1";
  const errorCode = searchParams.get("error");

  const [role, setRole] = useState(initialRole);
  const [mode, setMode] = useState(initialMode);

  const errorMessage =
    mode === "signup" ? SIGNUP_ERRORS[errorCode] : LOGIN_ERRORS[errorCode];

  // Build the heading and subtext ahead of time so the JSX below just
  // displays them, instead of choosing between them inline.
  let heading = "Welcome back, dancer";
  let subtext = "Log in to continue your courses.";
  if (mode === "signup") {
    heading = "Create your account";
    subtext = "Sign up to start learning.";
  } else if (role === "instructor") {
    heading = "Instructor sign in";
    subtext = "Manage your courses, sales and payouts.";
  }

  return (
    <main className="flex-1 bg-burgundy-deep flex items-center justify-center px-5 py-12">
      <div className="bg-ivory w-full max-w-sm p-9 relative">
        {wasRedirected && (
          <p className="text-xs text-burgundy bg-gold/15 border border-gold/40 px-3 py-2 mb-5">
            Please log in to view that page.
          </p>
        )}
        {errorMessage && (
          <p className="text-xs text-burgundy bg-gold/15 border border-gold/40 px-3 py-2 mb-5">
            {errorMessage}
          </p>
        )}

        <div className="flex border border-burgundy/20 mb-4">
          <button
            onClick={() => setRole("student")}
            className={`flex-1 py-3 text-xs uppercase tracking-widest ${
              role === "student" ? "bg-burgundy-deep text-gold-pale" : "text-ink/60"
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setRole("instructor")}
            className={`flex-1 py-3 text-xs uppercase tracking-widest ${
              role === "instructor" ? "bg-burgundy-deep text-gold-pale" : "text-ink/60"
            }`}
          >
            Instructor
          </button>
        </div>

        <div className="flex gap-5 mb-7 text-xs uppercase tracking-widest border-b border-burgundy/20">
          <button
            onClick={() => setMode("login")}
            className={`pb-2 border-b-2 ${
              mode === "login" ? "border-burgundy-deep text-burgundy-deep" : "border-transparent text-ink/50"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`pb-2 border-b-2 ${
              mode === "signup" ? "border-burgundy-deep text-burgundy-deep" : "border-transparent text-ink/50"
            }`}
          >
            Sign Up
          </button>
        </div>

        <h1 className="font-display text-xl mb-1">{heading}</h1>
        <p className="text-sm text-ink/60 mb-6">{subtext}</p>

        {mode === "signup" && role === "instructor" ? (
          <InstructorSignupNotice />
        ) : mode === "signup" ? (
          <SignupForm redirectTo={redirectTo} />
        ) : (
          <LoginFormFields role={role} redirectTo={redirectTo} />
        )}
      </div>
    </main>
  );
}

function LoginFormFields({ role, redirectTo }) {
  return (
    <>
      <form action={loginAction}>
        <input type="hidden" name="as" value={role} />
        <input type="hidden" name="redirect" value={redirectTo} />
        <Field label="Email">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full border border-burgundy/20 px-3 py-3 text-sm"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full border border-burgundy/20 px-3 py-3 text-sm"
          />
        </Field>
        <Button type="submit" variant="primary" className="w-full mt-2">
          Log In
        </Button>
      </form>

      <p className="text-center text-sm mt-4">
        <a href="/forgot-password" className="text-burgundy/70 hover:text-burgundy">
          Forgot your password?
        </a>
      </p>
    </>
  );
}

function SignupForm({ redirectTo }) {
  return (
    <form action={registerAction}>
      <input type="hidden" name="redirect" value={redirectTo} />
      <Field label="Name">
        <input
          type="text"
          name="name"
          required
          placeholder="Your name"
          className="w-full border border-burgundy/20 px-3 py-3 text-sm"
        />
      </Field>
      <Field label="Email">
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="w-full border border-burgundy/20 px-3 py-3 text-sm"
        />
      </Field>
      <Field label="Password">
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
        Create Account
      </Button>
    </form>
  );
}

function InstructorSignupNotice() {
  return (
    <div>
      <p className="text-sm text-ink/70 bg-gold/15 border border-gold/40 px-3 py-3 mb-5">
        Instructor accounts go through a short review before they&rsquo;re activated.
      </p>
      <Button href="/become-an-instructor" variant="primary" className="w-full">
        Apply to Teach
      </Button>
    </div>
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
