"use client";

import { Leaf } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Section, StepHeading } from "@/components/ui/StepHeading";
import { formatInr, formatKg, formatMaterial } from "@/lib/format";
import { PATHWAY_LABELS, PATHWAY_ORDER } from "@/lib/options";
import type { AnalysisResult, ConditionGrade, Pathway } from "@/lib/types";
import { OptionCard } from "./OptionCard";

const GRADE_LABELS: Record<ConditionGrade, string> = {
  A: "Like new",
  B: "Good, light wear",
  C: "Fair, needs repair",
  D: "Poor or not working",
};

/** Below this the estimate is shown with a caution note. */
const LOW_CONFIDENCE = 0.6;

interface ResultStepProps {
  result: AnalysisResult;
  selected: Pathway;
  onSelect: (pathway: Pathway) => void;
  onContinue: () => void;
  onStartOver: () => void;
}

export function ResultStep({ result, selected, onSelect, onContinue, onStartOver }: ResultStepProps) {
  const options = PATHWAY_ORDER.map((p) => result.options.find((o) => o.pathway === p)).filter(
    (o): o is NonNullable<typeof o> => Boolean(o),
  );
  const recommended  = options.find((o) => o.pathway === result.recommendedPathway);
  const confidencePct = Math.round(result.confidence * 100);
  const selectedLabel = PATHWAY_LABELS[selected].toLowerCase();

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <StepHeading title="Your options">
        {recommended
          ? `We recommend you ${PATHWAY_LABELS[recommended.pathway].toLowerCase()} it, for about ${formatInr(
              recommended.estimatedValueInr,
            )}. Compare all three below and choose what suits you.`
          : "Compare all three options below and choose what suits you."}
      </StepHeading>

      {/* ── Condition / Confidence strip ────────────────────────────── */}
      <dl className="grid grid-cols-2 overflow-hidden rounded-sm border border-line sm:max-w-sm">
        <div className="flex flex-col gap-1.5 border-r border-line bg-white p-4">
          <dt className="text-xs text-muted">Condition</dt>
          <dd className="text-md font-semibold text-ink">
            Grade {result.conditionGrade}
            <span className="block text-xs font-normal text-muted">{GRADE_LABELS[result.conditionGrade]}</span>
          </dd>
        </div>
        <div className="flex flex-col gap-1.5 bg-white p-4">
          <dt className="text-xs text-muted">Confidence</dt>
          <dd className="flex flex-col gap-2">
            <span className="text-md font-semibold text-ink">{confidencePct}%</span>
            {/* 6px rounded bar */}
            <span
              className="block h-1.5 w-full overflow-hidden rounded-full bg-line"
              aria-hidden
            >
              <span
                className="block h-1.5 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${confidencePct}%` }}
              />
            </span>
          </dd>
        </div>
      </dl>

      {result.confidence < LOW_CONFIDENCE && (
        <Alert tone="warning" title="This estimate is less certain than usual">
          The photos or answers left some doubt. The partner will confirm the final amount when
          they check the device.
        </Alert>
      )}

      {/* ── Option cards ────────────────────────────────────────────── */}
      <fieldset>
        <legend className="sr-only">Choose what to do with your device</legend>
        {/*
          On mobile, the recommended card is pushed first via CSS order.
          On md+ they sit in a three-column grid.
        */}
        <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:items-stretch">
          {options.map((o) => (
            <OptionCard
              key={o.pathway}
              option={o}
              recommended={o.pathway === result.recommendedPathway}
              selected={o.pathway === selected}
              onSelect={() => onSelect(o.pathway)}
            />
          ))}
        </div>
      </fieldset>

      {/* ── Environmental impact ────────────────────────────────────── */}
      <Section
        title="Environmental impact"
        description="Whichever option you choose, handing it to a partner keeps it out of landfill."
      >
        <div className="flex flex-col gap-4 rounded-sm border border-line bg-surface p-5 sm:flex-row sm:items-start sm:gap-8">
          <div className="flex items-center gap-3 sm:min-w-44">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary">
              <Leaf className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-xl font-semibold text-ink">{formatKg(result.impact.kgDiverted)}</p>
              <p className="text-xs text-muted">of e-waste diverted</p>
            </div>
          </div>
          {result.impact.materials.length > 0 && (
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium text-ink">Materials that can be recovered</p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-4">
                {result.impact.materials.map((m) => (
                  <div key={m.material}>
                    <dt className="text-xs text-muted">{m.material}</dt>
                    <dd className="text-sm font-medium text-ink">{formatMaterial(m)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </Section>

      {/* ── Continue ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
        <Button id="result-continue" onClick={onContinue}>
          Find a partner to {selectedLabel} it
        </Button>
        <Button id="result-start-over" variant="text" onClick={onStartOver} className="sm:ml-2">
          Check a different device
        </Button>
      </div>
    </div>
  );
}
