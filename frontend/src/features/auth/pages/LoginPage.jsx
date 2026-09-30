import { useNavigate, useSearchParams } from "react-router";
import { Alert } from "@/components/ui";
import { DASHBOARD_PATH } from "@/lib/labels";
import { safeRedirectPath } from "@/lib/redirects";
import { InstructorApplicationForm } from "../components/InstructorApplicationForm";
import { LoginForm } from "../components/LoginForm";
import { StudentSignupForm } from "../components/StudentSignupForm";

const COPY = {
  "student:login": ["Welcome back, dancer", "Log in to continue your courses."],
  "instructor:login": ["Instructor sign in", "Manage your courses, sales and payouts."],
  "student:signup": ["Create your account", "Sign up to start learning."],
  "instructor:signup": ["Apply to teach", "Tell us a bit about you — we'll review your application."],
};

/** Role and mode live in the URL, so every combination is linkable. */
export default function LoginPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const role = params.get("as") === "instructor" ? "instructor" : "student";
  const mode = params.get("mode") === "signup" ? "signup" : "login";
  const [heading, subtext] = COPY[`${role}:${mode}`];

  function update(changes) {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => next.set(key, value));
    next.delete("redirected");
    setParams(next, { replace: true });
  }

  function handleSignedIn(user) {
    navigate(safeRedirectPath(params.get("redirect"), DASHBOARD_PATH[user.role]), { replace: true });
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-burgundy-deep px-5 py-12">
      <div className="w-full max-w-sm bg-ivory p-9">
        {params.get("redirected") === "1" && (
          <Alert tone="info" className="mb-5 text-xs">
            Please log in to view that page.
          </Alert>
        )}

        <Toggle
          label="Account type"
          options={[
            ["student", "Student"],
            ["instructor", "Instructor"],
          ]}
          value={role}
          onChange={(value) => update({ as: value })}
          variant="block"
        />
        <Toggle
          label="Log in or sign up"
          options={[
            ["login", "Log In"],
            ["signup", "Sign Up"],
          ]}
          value={mode}
          onChange={(value) => update({ mode: value })}
          variant="tabs"
        />

        <h1 className="mb-1 font-display text-xl">{heading}</h1>
        <p className="mb-6 text-sm text-ink/60">{subtext}</p>

        {mode === "login" && <LoginForm onSignedIn={handleSignedIn} />}
        {mode === "signup" && role === "student" && <StudentSignupForm onSignedIn={handleSignedIn} />}
        {mode === "signup" && role === "instructor" && (
          <>
            <Alert tone="info" className="mb-5">
              Instructor accounts go through a short review before they&rsquo;re activated.
            </Alert>
            <InstructorApplicationForm />
          </>
        )}
      </div>
    </main>
  );
}

function Toggle({ label, options, value, onChange, variant }) {
  const block = variant === "block";
  return (
    <div
      role="tablist"
      aria-label={label}
      className={
        block
          ? "mb-4 flex border border-burgundy/20"
          : "mb-7 flex gap-5 border-b border-burgundy/20 text-xs tracking-widest uppercase"
      }
    >
      {options.map(([optionValue, optionLabel]) => {
        const selected = optionValue === value;
        const classes = block
          ? `flex-1 py-3 text-xs tracking-widest uppercase ${selected ? "bg-burgundy-deep text-gold-pale" : "text-ink/60"}`
          : `border-b-2 pb-2 ${selected ? "border-burgundy-deep text-burgundy-deep" : "border-transparent text-ink/50"}`;
        return (
          <button
            key={optionValue}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(optionValue)}
            className={classes}
          >
            {optionLabel}
          </button>
        );
      })}
    </div>
  );
}
