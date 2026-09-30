import { useId } from "react";

const LABEL = "block text-xs tracking-widest text-ink/60 uppercase";
const CONTROL =
  "mt-1 block w-full border bg-ivory px-3 py-2 text-sm tracking-normal normal-case text-ink focus:border-gold focus:outline-none";

function controlClasses(error) {
  return `${CONTROL} ${error ? "border-burgundy" : "border-gold/40"}`;
}

function FieldShell({ id, label, error, hint, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-burgundy">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({ label, error, hint, className, ...inputProps }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={className}>
      <input
        id={id}
        type="text"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={controlClasses(error)}
        {...inputProps}
      />
    </FieldShell>
  );
}

export function TextAreaField({ label, error, hint, className, rows = 4, ...textareaProps }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={className}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={controlClasses(error)}
        {...textareaProps}
      />
    </FieldShell>
  );
}

/** @param options [{ value, label }] */
export function SelectField({ label, error, options, className, ...selectProps }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} className={className}>
      <select id={id} aria-invalid={Boolean(error)} className={controlClasses(error)} {...selectProps}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({ label, className = "", ...inputProps }) {
  return (
    <label className={`flex items-center gap-2 text-sm text-ink/70 ${className}`}>
      <input type="checkbox" className="accent-burgundy" {...inputProps} />
      {label}
    </label>
  );
}
