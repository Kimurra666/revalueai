"use client";

import { Check } from "lucide-react";
import { FieldError } from "./Field";

interface ChoiceGroupProps<T extends string | boolean> {
  name: string;
  legend: string;
  hint?: string;
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  error?: string;
}

/**
 * Segmented radio group — joined pill buttons.
 * Selected button gets a tint fill, green border and a check.
 * Hint sits above the buttons so rows align across a grid.
 */
export function ChoiceGroup<T extends string | boolean>({
  name,
  legend,
  hint,
  value,
  options,
  onChange,
  error,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset
      className="flex flex-col gap-1.5"
      aria-describedby={error ? `${name}-error` : undefined}
    >
      <legend className="text-sm font-medium text-ink">{legend}</legend>

      {hint && <p className="text-xs text-muted">{hint}</p>}

      {/* Joined button strip */}
      <div className="flex h-control" role="group">
        {options.map((opt, i) => {
          const id      = `${name}-${String(opt.value)}`;
          const checked = value === opt.value;
          const isFirst = i === 0;
          const isLast  = i === options.length - 1;

          return (
            <label
              key={id}
              htmlFor={id}
              className={[
                "relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 border px-3",
                "text-sm font-medium transition-colors duration-150",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
                isFirst ? "rounded-l-sm" : "",
                isLast  ? "rounded-r-sm" : "",
                // Left-hand border of adjacent buttons collapses the middle double-border
                !isFirst ? "-ml-px" : "",
                checked
                  ? "z-10 border-primary bg-primary-tint text-primary-dark"
                  : error
                    ? "border-danger bg-white text-ink hover:bg-surface"
                    : "border-line-strong bg-white text-ink hover:bg-surface",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                id={id}
                type="radio"
                name={name}
                className="sr-only"
                checked={checked}
                onChange={() => onChange(opt.value)}
              />
              {checked && (
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden strokeWidth={3} />
              )}
              {opt.label}
            </label>
          );
        })}
      </div>

      <FieldError id={name} error={error} />
    </fieldset>
  );
}
