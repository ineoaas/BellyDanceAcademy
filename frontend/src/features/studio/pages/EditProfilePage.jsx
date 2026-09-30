import {
  ActionButton,
  Alert,
  AsyncContent,
  Button,
  ErrorAlert,
  PageHeader,
  Panel,
  TextAreaField,
  TextField,
} from "@/components/ui";
import { formValues } from "@/lib/forms";
import { useInstructorProfile, useSaveInstructorProfile } from "../hooks";

export default function EditProfilePage() {
  const profile = useInstructorProfile();
  const save = useSaveInstructorProfile();

  function handleSubmit(event) {
    event.preventDefault();
    const { city, credentials, bio } = formValues(event.currentTarget);
    save.mutate({ city, credentials, bio });
  }

  return (
    <AsyncContent query={profile}>
      {(existing) => (
        <>
          <PageHeader
            eyebrow="Profile"
            title="Edit Your Instructor Profile"
            actions={
              existing && (
                <ActionButton to={`/instructors/${existing.slug}`}>View Public Profile</ActionButton>
              )
            }
          />
          <div className="max-w-lg">
            {save.isSuccess && (
              <Alert tone="success" className="mb-6">
                Profile saved.
              </Alert>
            )}
            {!existing && (
              <p className="mb-6 text-sm text-ink/55">
                You don&apos;t have a public profile yet — save one below to appear on the Instructors page.
              </p>
            )}
            <Panel>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <ErrorAlert error={save.error} />
                <TextField
                  label="City"
                  name="city"
                  maxLength={120}
                  placeholder="Cairo, Egypt"
                  defaultValue={existing?.city}
                />
                <TextField
                  label="Credentials"
                  name="credentials"
                  maxLength={200}
                  placeholder="10+ years performing, Cairo"
                  defaultValue={existing?.credentials}
                />
                <TextAreaField
                  label="Bio"
                  name="bio"
                  rows={5}
                  maxLength={5000}
                  placeholder="Tell students about your background and teaching style."
                  defaultValue={existing?.bio}
                />
                <Button type="submit" className="mt-1 self-start" disabled={save.isPending}>
                  Save Profile
                </Button>
              </form>
            </Panel>
          </div>
        </>
      )}
    </AsyncContent>
  );
}
