import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

/*
 * Shared control class.
 * 44px height (h-control), 6px radius, line-strong border on idle,
 * green border on focus, danger border on error.
 * font-size: 16px (text-base) prevents iOS auto-zoom on focus.
 */
const control =
  "block w-full rounded-sm border bg-white px-3 text-base text-ink placeholder:text-muted" +
  " transition-colors duration-150" +
  " focus:outline-none focus:border-primary focus:ring-0" +
  " disabled:bg-surface disabled:text-muted";

function borderFor(error?: string) {
  return error ? "border-danger" : "border-line-strong hover:border-muted";
}

/* ── Field wrapper ─────────────────────────────────────────────────────── */

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}

/**
 * Label, optional hint (above the control), error text (below).
 * Controls are rendered as `children`.
 */
export function Field({ id, label, hint, error, optional, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">(optional)</span>}
      </label>
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {children}
      <FieldError id={id} error={error} />
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} className="text-xs text-danger" role="alert">
      {error}
    </p>
  );
}

/** Returns the id of the element that describes this control (hint or error). */
export function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

/* ── Controls ──────────────────────────────────────────────────────────── */

export function Input({
  error,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      aria-invalid={error ? true : undefined}
      className={`${control} h-control ${borderFor(error)} ${className}`}
      {...rest}
    />
  );
}

export function Textarea({
  error,
  className = "",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <textarea
      aria-invalid={error ? true : undefined}
      className={`${control} py-2.5 min-h-[6rem] ${borderFor(error)} ${className}`}
      {...rest}
    />
  );
}

export function Select({
  error,
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <select
      aria-invalid={error ? true : undefined}
      className={`${control} h-control appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%235B6770'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpath%20d='m6%209%206%206%206-6'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10 ${borderFor(error)} ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}
