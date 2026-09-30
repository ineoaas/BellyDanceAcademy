import { Alert, Button, ErrorAlert, PageHero, TextAreaField, TextField } from "@/components/ui";
import { fieldError, formValues } from "@/lib/forms";
import { useSendContactMessage } from "../hooks";

export default function ContactPage() {
  const send = useSendContactMessage();

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    send.mutate(formValues(form), { onSuccess: () => form.reset() });
  }

  return (
    <main className="flex-1">
      <PageHero eyebrow="Contact" title="Get in touch">
        Questions about a course, a purchase, or teaching with us — send a message and we&apos;ll reply by email.
      </PageHero>
      <section className="py-14">
        <div className="mx-auto max-w-md px-6">
          {send.isSuccess && (
            <Alert tone="success" className="mb-6">
              Message sent — we&apos;ll get back to you by email.
            </Alert>
          )}
          <ErrorAlert error={send.error} className="mb-6" />
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField label="Name" name="name" required autoComplete="name" error={fieldError(send.error, "name")} />
            <TextField label="Email" name="email" type="email" required autoComplete="email" error={fieldError(send.error, "email")} />
            <TextAreaField label="Message" name="message" required rows={5} maxLength={5000} error={fieldError(send.error, "message")} />
            <Button type="submit" className="self-start" disabled={send.isPending}>
              {send.isPending ? "Sending…" : "Send Message"}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
