import { useState } from "react";
import { Alert, Button, ErrorAlert } from "@/components/ui";
import { formValues } from "@/lib/forms";
import { useRegisterStudent } from "../hooks";
import { passwordPairError } from "../passwords";
import { RegistrationFields } from "./RegistrationFields";

export function StudentSignupForm({ onSignedIn }) {
  const register = useRegisterStudent();
  const [localError, setLocalError] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    const values = formValues(event.currentTarget);
    const problem = passwordPairError(values);
    setLocalError(problem);
    if (problem) return;
    register.mutate(
      { name: values.name, email: values.email, password: values.password },
      { onSuccess: (session) => onSignedIn(session.user) },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Alert tone="error">{localError}</Alert>
      <ErrorAlert error={register.error} />
      <RegistrationFields error={register.error} />
      <Button type="submit" className="mt-2 w-full" disabled={register.isPending}>
        {register.isPending ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}
