import { Button, ErrorAlert, SelectField, TextAreaField, TextField } from "@/components/ui";
import { centsToDollars, dollarsToCents } from "@/lib/format";
import { fieldError, formValues } from "@/lib/forms";
import { LEVELS } from "@/lib/labels";

/** Shared by create and edit. Prices are entered in dollars and sent in cents. */
export function CourseForm({ course, mutation, submitLabel, onSaved }) {
  const error = mutation.error;

  function handleSubmit(event) {
    event.preventDefault();
    const values = formValues(event.currentTarget);
    mutation.mutate(
      {
        title: values.title,
        style: values.style,
        level: values.level,
        priceCents: dollarsToCents(values.price),
        originalPriceCents: dollarsToCents(values.originalPrice),
        durationLabel: values.durationLabel,
        description: values.description,
        about: values.about,
      },
      { onSuccess: onSaved },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <ErrorAlert error={error} />
      <TextField
        label="Title"
        name="title"
        required
        maxLength={150}
        defaultValue={course?.title}
        error={fieldError(error, "title")}
      />
      <TextField
        label="Style"
        name="style"
        maxLength={60}
        placeholder="Baladi, Veil Work, Drum Solo…"
        defaultValue={course?.style}
        error={fieldError(error, "style")}
      />
      <SelectField label="Level" name="level" defaultValue={course?.level ?? "BEGINNER"} options={LEVELS} />
      <div className="flex gap-3">
        <TextField
          className="flex-1"
          label="Price ($)"
          name="price"
          type="number"
          min="1"
          step="0.01"
          required
          defaultValue={centsToDollars(course?.priceCents)}
          error={fieldError(error, "priceCents")}
        />
        <TextField
          className="flex-1"
          label="Was Price ($, optional)"
          name="originalPrice"
          type="number"
          min="1"
          step="0.01"
          defaultValue={centsToDollars(course?.originalPriceCents)}
          error={fieldError(error, "originalPriceCents")}
        />
      </div>
      <TextField
        label="Estimated Duration"
        name="durationLabel"
        maxLength={40}
        placeholder="6h 40m"
        defaultValue={course?.durationLabel}
      />
      <TextField
        label="Short Description"
        name="description"
        maxLength={300}
        defaultValue={course?.description}
        error={fieldError(error, "description")}
      />
      <TextAreaField
        label="About This Course"
        name="about"
        rows={5}
        defaultValue={course?.about}
        error={fieldError(error, "about")}
      />
      <Button type="submit" className="mt-1 self-start" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
