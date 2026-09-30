/** A submitted form's fields as a plain object (checkboxes → booleans). */
export function formValues(form) {
  const values = Object.fromEntries(new FormData(form));
  form.querySelectorAll('input[type="checkbox"][name]').forEach((checkbox) => {
    values[checkbox.name] = checkbox.checked;
  });
  return values;
}

/** The server's validation message for one field, if any. */
export function fieldError(error, field) {
  return error?.fieldErrors?.[field];
}
