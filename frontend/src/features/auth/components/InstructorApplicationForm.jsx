import { useState } from "react";
import { Alert, Button, ErrorAlert } from "@/components/ui";
import { formValues } from "@/lib/forms";
import { useApplyAsInstructor } from "../hooks";
import { passwordPairError } from "../passwords";
import { RegistrationFields } from "./RegistrationFields";

/** Creates a pending instructor account — it stays inactive until an admin approves it. */
export function InstructorApplicationForm() {
  const apply = useApplyAsInstructor();
  const [localError, setLocalError] = useState(null);

  if (apply.isSuccess) {
    return (
      <Alert tone="info">
        Thanks for applying — we&rsquo;ll review your application and email you once your account is activated.
      </Alert>
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    const values = formValues(event.currentTarget);
    const problem = passwordPairError(values);
    setLocalError(problem);
    if (!problem) apply.mutate({ name: values.name, email: values.email, password: values.password });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Alert tone="error">{localError}</Alert>
      <ErrorAlert error={apply.error} />
      <RegistrationFields error={apply.error} />
      <Button type="submit" className="mt-2 w-full" disabled={apply.isPending}>
        {apply.isPending ? "Submitting…" : "Submit Application"}
      </Button>
    </form>
  );
}
