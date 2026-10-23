import { Check } from "lucide-react";

export const STEPS = ["Details", "Analysis", "Result", "Next step"] as const;

/** `current` is 0-based. Steps before it are shown as done. */
export function StepIndicator({ current }: { current: number }) {
  const progressPct = Math.round(((current) / (STEPS.length - 1)) * 100);

  return (
    <nav aria-label="Progress">
      {/* ── Desktop: step dots + connector line ── */}
      <ol className="hidden items-center gap-0 sm:flex">
        {STEPS.map((label, i) => {
          const done   = i < current;
          const active = i === current;
          return (
            <li
              key={label}
              aria-current={active ? "step" : undefined}
              className="flex flex-1 items-center"
            >
              {/* Connector line to the left */}
              {i > 0 && (
                <span
                  className={`h-px flex-1 transition-colors duration-200 ${
                    done ? "bg-primary" : "bg-line"
                  }`}
                  aria-hidden
                />
              )}

              {/* Dot + label */}
              <span className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-200 ${
                    done
                      ? "bg-primary text-white"
                      : active
                        ? "border-2 border-primary bg-white text-primary"
                        : "border border-line bg-white text-muted"
                  }`}
                  aria-hidden
                >
                  {done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={`whitespace-nowrap text-xs ${
                    active
                      ? "font-medium text-ink"
                      : done
                        ? "text-ink"
                        : "text-muted"
                  }`}
                >
                  {label}
                </span>
              </span>

              {/* Connector line to the right (last item only needs left) */}
              {i < STEPS.length - 1 && (
                <span
                  className={`h-px flex-1 transition-colors duration-200 ${
                    done || active ? "bg-primary" : "bg-line"
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* ── Mobile: "Step X of Y – Label" + progress bar ── */}
      <div className="sm:hidden" aria-hidden>
        <p className="mb-2 text-sm text-muted">
          <span className="font-medium text-ink">
            Step {current + 1} of {STEPS.length}
          </span>
          {" "}–{" "}
          {STEPS[current]}
        </p>
        <div className="h-1 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-1 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
      {/* Screen-reader text for mobile */}
      <p className="sr-only">
        Step {current + 1} of {STEPS.length}: {STEPS[current]}
      </p>
    </nav>
  );
}
