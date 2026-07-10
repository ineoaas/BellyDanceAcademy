"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import { useAuth } from "@/lib/AuthContext";

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
  const redirectTo = searchParams.get("redirect");
  const wasRedirected = searchParams.get("redirected") === "1";

  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();

    let name = "Nadia Karim";
    let destination = "/student";
    if (role === "instructor") {
      name = "Amara Nour";
      destination = "/instructor";
    }

    login(role, name);
    router.push(redirectTo || destination);
  }

  // Build the heading, subtext and footer link ahead of time so the JSX
  // below just displays them, instead of choosing between them inline.
  let heading = "Welcome back, dancer";
  let subtext = "Log in to continue your courses.";
  let footerLink = (
    <>New here? <a href="/courses" className="text-burgundy font-medium">Browse courses</a> to get started.</>
  );

  if (role === "instructor") {
    heading = "Instructor sign in";
    subtext = "Manage your courses, sales and payouts.";
    footerLink = (
      <>Not a partner yet? <span className="text-burgundy font-medium">Apply to teach</span></>
    );
  }

  return (
    <main className="flex-1 bg-burgundy-deep flex items-center justify-center px-5 py-12">
      <div className="bg-ivory w-full max-w-sm p-9 relative">
        {wasRedirected && (
          <p className="text-xs text-burgundy bg-gold/15 border border-gold/40 px-3 py-2 mb-5">
            Please log in to view that page.
          </p>
        )}
        <div className="flex border border-burgundy/20 mb-7">
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

        <h1 className="font-display text-xl mb-1">{heading}</h1>
        <p className="text-sm text-ink/60 mb-6">{subtext}</p>

        <form onSubmit={handleSubmit}>
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-burgundy/20 px-3 py-3 text-sm"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-burgundy/20 px-3 py-3 text-sm"
            />
          </Field>
          <Button type="submit" variant="primary" className="w-full mt-2">
            Log In
          </Button>
        </form>

        <p className="text-center text-sm text-ink/60 mt-5">{footerLink}</p>
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
