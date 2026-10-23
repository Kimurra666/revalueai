"use client";

import { formatDays, formatInr } from "@/lib/format";
import { EFFORT_LABELS, PATHWAY_LABELS, PATHWAY_SUMMARY } from "@/lib/options";
import type { PathwayOption } from "@/lib/types";

interface OptionCardProps {
  option: PathwayOption;
  recommended: boolean;
  selected: boolean;
  onSelect: () => void;
}

export function OptionCard({ option, recommended, selected, onSelect }: OptionCardProps) {
  const id    = `option-${option.pathway}`;
  const label = PATHWAY_LABELS[option.pathway];

  return (
    <label
      htmlFor={id}
      /* On mobile, the recommended card floats to top with order-first */
      className={[
        "flex cursor-pointer flex-col overflow-hidden rounded-sm border bg-white",
        "transition-colors duration-150",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
        recommended
          ? "order-first border-primary md:order-none ring-1 ring-primary"
          : "border-line hover:border-line-strong md:order-none",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        id={id}
        type="radio"
        name="pathway"
        value={option.pathway}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />

      {/* ── Recommended tag ── */}
      {recommended && (
        <div className="bg-primary-tint px-4 py-1.5">
          <span className="text-xs font-semibold text-primary-dark tracking-wide uppercase">
            Recommended
          </span>
        </div>
      )}

      {/* ── Card body ── */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Title + summary */}
        <div>
          <h2 className="text-md font-semibold text-ink">{label}</h2>
          <p className="text-sm text-muted">{PATHWAY_SUMMARY[option.pathway]}</p>
        </div>

        {/* Amount */}
        <div>
          <p className="tabular-nums text-2xl font-semibold text-ink">
            {formatInr(option.estimatedValueInr)}
          </p>
          <p className="text-xs text-muted">Estimated amount you receive</p>
        </div>

        {/* Effort / Time to cash */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 text-sm">
          <div>
            <dt className="text-xs text-muted">Effort</dt>
            <dd className="text-sm font-medium text-ink">{EFFORT_LABELS[option.effort]}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Time to cash</dt>
            <dd className="text-sm font-medium text-ink tabular-nums">{formatDays(option.timeToCash)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-muted">Where it goes</dt>
            <dd className="text-sm text-ink">{option.destination}</dd>
          </div>
        </dl>

        {/* Reason */}
        {recommended ? (
          <div className="rounded-sm bg-primary-tint p-3">
            <p className="text-xs font-semibold text-primary-dark">Why this option</p>
            <p className="mt-0.5 text-xs text-ink leading-normal">{option.reasoning}</p>
          </div>
        ) : (
          <p className="text-xs text-muted leading-normal">{option.reasoning}</p>
        )}
      </div>

      {/* ── Choose footer ── */}
      <div
        className={`flex items-center gap-2.5 border-t px-4 py-3 text-sm font-medium transition-colors duration-150 ${
          selected ? "border-primary bg-primary-tint text-primary-dark" : "border-line bg-surface text-ink"
        }`}
      >
        {/* Radio dot */}
        <span
          className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
            selected ? "border-primary" : "border-muted"
          }`}
          aria-hidden
        >
          {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
        </span>
        {selected ? "Selected" : `Choose ${label.toLowerCase()}`}
      </div>
    </label>
  );
}
