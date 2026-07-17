import { useId } from "react";
import Input from "lib/primitives/Input";

/**
 * Beschriftetes Eingabefeld für react-hook-form-Controller.
 * Erwartet das Rückgabeobjekt von useController als `controller`-Prop —
 * importiert selbst kein react-hook-form.
 */
export default function TextField({
  label,
  controller,
  required = false,
  help,
  ...inputProps
}) {
  const id = useId();
  const { field, fieldState } = controller;
  const error = fieldState.error?.message;
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-[5px] block text-[14.5px] font-semibold text-neutral-700"
      >
        {label}
        {required && (
          <span className="text-brand" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      <Input
        id={id}
        hasError={Boolean(error)}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : help ? helpId : undefined}
        {...field}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm font-semibold text-danger">
          {error}
        </p>
      ) : (
        help && (
          <p id={helpId} className="mt-1.5 text-[13.5px] text-muted">
            {help}
          </p>
        )
      )}
    </div>
  );
}
