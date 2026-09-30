import { Link } from "react-router";
import { Button, ErrorAlert, TextField } from "@/components/ui";
import { formValues } from "@/lib/forms";
import { useLogin } from "../hooks";

export function LoginForm({ onSignedIn }) {
  const login = useLogin();

  function handleSubmit(event) {
    event.preventDefault();
    const { email, password } = formValues(event.currentTarget);
    login.mutate({ email, password }, { onSuccess: (session) => onSignedIn(session.user) });
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorAlert error={login.error} />
        <TextField label="Email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        <TextField label="Password" name="password" type="password" required autoComplete="current-password" />
        <Button type="submit" className="mt-2 w-full" disabled={login.isPending}>
          {login.isPending ? "Logging in…" : "Log In"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link to="/forgot-password" className="text-burgundy/70 hover:text-burgundy">
          Forgot your password?
        </Link>
      </p>
    </>
  );
}
