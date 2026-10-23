"use client";

import { useCallback, useEffect, useState } from "react";
import { AnalysisStep } from "@/components/analysis/AnalysisStep";
import { DetailsStep } from "@/components/details/DetailsStep";
import { DevScenarioToggle } from "@/components/DevScenarioToggle";
import { ConfirmationStep } from "@/components/next/ConfirmationStep";
import { NextStep } from "@/components/next/NextStep";
import { ResultStep } from "@/components/result/ResultStep";
import { StepIndicator } from "@/components/StepIndicator";
import { ApiError, submitDevice } from "@/lib/api";
import type { AnalysisResult, Partner, Pathway, PickupConfirmation } from "@/lib/types";
import { EMPTY_DETAILS_FORM, toSubmission, type DetailsForm } from "@/lib/validation";

type Step = "details" | "analysis" | "result" | "next" | "done";

/** Index into STEPS for the progress bar. "done" marks every step complete. */
const STEP_INDEX: Record<Step, number> = { details: 0, analysis: 1, result: 2, next: 3, done: 4 };

/** Narrow column for forms, wide for the three-card comparison. */
const STEP_WIDTH: Record<Step, string> = {
  details:  "container-form",
  analysis: "container-form",
  result:   "container-wide",
  next:     "container-form",
  done:     "container-form",
};

/** Owns all state for the check flow and decides which step is shown. */
export function CheckFlow() {
  const [step, setStep] = useState<Step>("details");

  const [form, setForm] = useState<DetailsForm>(EMPTY_DETAILS_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [pathway, setPathway] = useState<Pathway | null>(null);
  const [booking, setBooking] = useState<{ confirmation: PickupConfirmation; partner: Partner } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  const handleSubmitDetails = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitDevice(toSubmission(form));
      setSubmissionId(res.submissionId);
      setResult(null);
      setPathway(null);
      setStep("analysis");
    } catch (err: unknown) {
      setSubmitError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Stable so AnalysisStep's effect does not re-run on every render.
  const handleAnalysisDone = useCallback((r: AnalysisResult) => {
    setResult(r);
    setPathway(r.recommendedPathway);
    setStep("result");
  }, []);

  const startOver = () => {
    setForm(EMPTY_DETAILS_FORM);
    setSubmitError(null);
    setSubmissionId(null);
    setResult(null);
    setPathway(null);
    setBooking(null);
    setStep("details");
  };

  const selectedOption = result && pathway ? result.options.find((o) => o.pathway === pathway) : undefined;

  return (
    <>
      <main className={`mx-auto flex w-full flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 ${STEP_WIDTH[step]}`}>
        <StepIndicator current={STEP_INDEX[step]} />

        {step === "details" && (
          <DetailsStep
            form={form}
            onChange={setForm}
            onSubmit={handleSubmitDetails}
            submitting={submitting}
            submitError={submitError}
          />
        )}

        {step === "analysis" && submissionId && (
          <AnalysisStep submissionId={submissionId} onDone={handleAnalysisDone} onEdit={() => setStep("details")} />
        )}

        {step === "result" && result && pathway && (
          <ResultStep
            result={result}
            selected={pathway}
            onSelect={setPathway}
            onContinue={() => setStep("next")}
            onStartOver={startOver}
          />
        )}

        {step === "next" && submissionId && selectedOption && (
          <NextStep
            submissionId={submissionId}
            option={selectedOption}
            onBack={() => setStep("result")}
            onConfirmed={(confirmation, partner) => {
              setBooking({ confirmation, partner });
              setStep("done");
            }}
          />
        )}

        {step === "done" && booking && selectedOption && (
          <ConfirmationStep
            confirmation={booking.confirmation}
            partner={booking.partner}
            option={selectedOption}
            onStartOver={startOver}
          />
        )}
      </main>
      <DevScenarioToggle />
    </>
  );
}
