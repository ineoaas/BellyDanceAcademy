import { Link } from "react-router";
import { TextField } from "@/components/ui";
import { fieldError } from "@/lib/forms";
import { MIN_PASSWORD_LENGTH } from "../passwords";

/**
 * Name, email, a confirmed password and the terms notice — shared by student
 * sign-up and instructor applications.
 */
export function RegistrationFields({ error }) {
  return (
    <>
      <TextField label="Name" name="name" required autoComplete="name" placeholder="Your name" error={fieldError(error, "name")} />
      <TextField
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        error={fieldError(error, "email")}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        autoComplete="new-password"
        error={fieldError(error, "password")}
      />
      <TextField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        autoComplete="new-password"
      />
      <p className="text-xs text-ink/55">
        By continuing you agree to our{" "}
        <Link to="/terms" className="underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
}
