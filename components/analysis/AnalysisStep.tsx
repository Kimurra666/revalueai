"use client";

import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { StepHeading } from "@/components/ui/StepHeading";
import { analyseDevice, ApiError } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";

const CHECKS = [
  "Reading device condition",
  "Checking resale prices",
  "Evaluating refurbishment",
  "Checking recycling value",
];

const TICK_MS = 1100;

interface AnalysisStepProps {
  submissionId: string;
  onDone: (result: AnalysisResult) => void;
  onEdit: () => void;
}

export function AnalysisStep({ submissionId, onDone, onEdit }: AnalysisStepProps) {
  const [completed, setCompleted] = useState(0);
  const [error, setError]         = useState<string | null>(null);
  const [attempt, setAttempt]     = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    setCompleted(0);
    setError(null);

    // Tick through the checks while waiting, but never mark the last one
    // done until the real response has arrived.
    const interval = setInterval(() => {
      setCompleted((c) => Math.min(c + 1, CHECKS.length - 1));
    }, TICK_MS);

    analyseDevice(submissionId)
      .then((result) => {
        clearInterval(interval);
        if (cancelled) return;
        setCompleted(CHECKS.length - 1);
        timers.push(setTimeout(() => !cancelled && setCompleted(CHECKS.length), 300));
        timers.push(setTimeout(() => !cancelled && onDone(result), 800));
      })
      .catch((err: unknown) => {
        clearInterval(interval);
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      });

    return () => {
      cancelled = true;
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
    // onDone is stable from the parent; re-run only on new submission or retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId, attempt]);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <StepHeading title={error ? "We could not finish the check" : "Checking your device"}>
        {error ? "Your details are saved. You can try again now." : "This usually takes a few seconds."}
      </StepHeading>

      {/* ── Stepper list ────────────────────────────────────────────── */}
      <ol
        className="relative flex flex-col rounded-sm border border-line"
        aria-label="Checks"
      >
        {/* Vertical progress line */}
        <span
          className="pointer-events-none absolute top-0 left-[1.9375rem] w-px bg-line"
          style={{ height: `calc(100% - 2.5rem)`, top: "1.25rem" }}
          aria-hidden
        />

        {CHECKS.map((label, i) => {
          const done   = i < completed;
          const active = i === completed && !error;
          const failed = i === completed && !!error;

          return (
            <li
              key={label}
              className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-line" : ""}`}
            >
              {/* Status indicator */}
              <span className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden>
                {done ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white animate-fade-in">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <span
                    className={`h-4 w-4 rounded-full border-2 bg-white ${failed ? "border-danger" : "border-line"}`}
                  />
                )}
              </span>

              <span
                className={`text-sm ${
                  done || active ? "text-ink" : failed ? "text-danger" : "text-muted"
                }`}
              >
                {label}
              </span>
              <span className="sr-only">
                {done ? "done" : active ? "in progress" : failed ? "failed" : "waiting"}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Live region for screen readers */}
      <p className="sr-only" aria-live="polite">
        {error
          ? `Check failed. ${error}`
          : completed === CHECKS.length
            ? "All checks done."
            : CHECKS[completed]}
      </p>

      {error && (
        <div className="flex flex-col gap-4">
          <Alert tone="error" title="Check did not complete">
            {error}
          </Alert>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button id="analysis-retry" onClick={() => setAttempt((a) => a + 1)}>
              Try again
            </Button>
            <Button id="analysis-edit" variant="secondary" onClick={onEdit}>
              Edit details
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
