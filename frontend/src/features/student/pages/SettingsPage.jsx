import { useState } from "react";
import { ActionButton, Alert, ErrorAlert, PageHeader, Panel, TextField } from "@/components/ui";
import { useCurrentUser } from "@/features/auth/hooks";
import { MIN_PASSWORD_LENGTH } from "@/features/auth/passwords";
import { fieldError, formValues } from "@/lib/forms";
import { useChangePassword, useUpdateProfile } from "../hooks";

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Settings" title="Profile Settings" />
      <div className="flex max-w-sm flex-col gap-6">
        <ProfileForm />
        <PasswordForm />
      </div>
    </>
  );
}

function ProfileForm() {
  const user = useCurrentUser();
  const update = useUpdateProfile();

  function handleSubmit(event) {
    event.preventDefault();
    const { name, email } = formValues(event.currentTarget);
    update.mutate({ name, email });
  }

  return (
    <Panel title="Your Details">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {update.isSuccess && <Alert tone="success">Profile updated.</Alert>}
        <ErrorAlert error={update.error} />
        <TextField label="Name" name="name" defaultValue={user.name} required error={fieldError(update.error, "name")} />
        <TextField
          label="Email"
          name="email"
          type="email"
          defaultValue={user.email}
          required
          error={fieldError(update.error, "email")}
        />
        <ActionButton type="submit" variant="solid" className="mt-1 self-start px-5 py-3" disabled={update.isPending}>
          Save Changes
        </ActionButton>
      </form>
    </Panel>
  );
}

function PasswordForm() {
  const change = useChangePassword();
  const [mismatch, setMismatch] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const { currentPassword, newPassword, confirmPassword } = formValues(form);
    setMismatch(newPassword !== confirmPassword);
    if (newPassword !== confirmPassword) return;
    change.mutate({ currentPassword, newPassword }, { onSuccess: () => form.reset() });
  }

  return (
    <Panel title="Change Password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {change.isSuccess && <Alert tone="success">Password changed.</Alert>}
        {mismatch && <Alert tone="error">New passwords don&apos;t match.</Alert>}
        <ErrorAlert error={change.error} />
        <TextField label="Current password" name="currentPassword" type="password" required autoComplete="current-password" />
        <TextField
          label="New password"
          name="newPassword"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          error={fieldError(change.error, "newPassword")}
        />
        <TextField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
        />
        <ActionButton type="submit" variant="solid" className="mt-1 self-start px-5 py-3" disabled={change.isPending}>
          Change Password
        </ActionButton>
      </form>
    </Panel>
  );
}
