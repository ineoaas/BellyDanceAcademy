import { TextField } from "@/components/ui";
import { fieldError } from "@/lib/forms";
import { MIN_PASSWORD_LENGTH } from "../passwords";

/** Name, email and a confirmed password — shared by student sign-up and instructor applications. */
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
    </>
  );
}
