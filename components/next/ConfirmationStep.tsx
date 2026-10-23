"use client";

import { CircleCheck, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { StepHeading } from "@/components/ui/StepHeading";
import { formatDate, formatInr } from "@/lib/format";
import { PATHWAY_LABELS, SLOT_LABELS } from "@/lib/options";
import type { Partner, PathwayOption, PickupConfirmation } from "@/lib/types";

interface ConfirmationStepProps {
  confirmation: PickupConfirmation;
  partner: Partner;
  option: PathwayOption;
  onStartOver: () => void;
}

const CHECKLIST = [
  "Back up your photos, contacts and files.",
  "Sign out of your accounts and turn off device-finder features.",
  "Reset the device to factory settings and remove any SIM or memory card.",
  "Keep the reference number ready when the partner calls.",
];

export function ConfirmationStep({
  confirmation,
  partner,
  option,
  onStartOver,
}: ConfirmationStepProps) {
  const isPickup = confirmation.method === "pickup";
  const [copied, setCopied] = useState(false);

  const copyRef = () => {
    navigator.clipboard.writeText(confirmation.requestId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* ── Success icon + heading ────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-tint text-primary">
          <CircleCheck className="h-6 w-6" aria-hidden />
        </span>
        <StepHeading title="Request sent">
          {partner.name} will call you within one working day to confirm the{" "}
          {isPickup ? "pickup" : "drop-off"}.
        </StepHeading>
      </div>

      {/* ── Reference number ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 rounded-sm border border-line bg-surface px-4 py-3">
        <div className="flex-1">
          <p className="text-xs text-muted">Reference number</p>
          <p className="tabular-nums text-lg font-semibold tracking-wide text-ink">
            {confirmation.requestId}
          </p>
        </div>
        <button
          type="button"
          onClick={copyRef}
          aria-label="Copy reference number"
          className="flex h-9 items-center gap-1.5 rounded-sm border border-line bg-white px-3 text-xs font-medium text-ink hover:bg-surface"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* ── Summary ──────────────────────────────────────────────── */}
      <dl className="grid overflow-hidden rounded-sm border border-line text-sm sm:grid-cols-2">
        <Row label="Option"    value={`${PATHWAY_LABELS[option.pathway]}, about ${formatInr(option.estimatedValueInr)}`} />
        <Row label="Partner"   value={partner.name} />
        <Row label="Handover"  value={isPickup ? "Pickup from your address" : `Drop-off at ${partner.area}, ${partner.city}`} />
        <Row label="Date"      value={formatDate(confirmation.preferredDate)} />
        <Row label="Time"      value={SLOT_LABELS[confirmation.preferredSlot]} />
      </dl>

      {/* ── Before the handover checklist ────────────────────────── */}
      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <h2 className="text-lg font-semibold text-ink">Before the handover</h2>
        <ul className="flex flex-col gap-2">
          {CHECKLIST.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <input
                id={`checklist-${i}`}
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-label={item}
              />
              <label htmlFor={`checklist-${i}`} className="text-sm text-muted leading-normal cursor-pointer">
                {item}
              </label>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Change something ─────────────────────────────────────── */}
      <section className="flex flex-col gap-1 rounded-sm border border-line bg-surface p-4">
        <h2 className="text-md font-semibold text-ink">Need to change something?</h2>
        <p className="text-sm text-muted leading-normal">
          Contact the partner directly at{" "}
          <a
            className="text-primary underline-offset-4 hover:underline"
            href={`tel:${partner.phone.replace(/\s/g, "")}`}
          >
            {partner.phone}
          </a>{" "}
          or{" "}
          <a
            className="text-primary underline-offset-4 hover:underline"
            href={`mailto:${partner.email}`}
          >
            {partner.email}
          </a>
          .
        </p>
      </section>

      {/* ── Action ───────────────────────────────────────────────── */}
      <div className="border-t border-line pt-6">
        <Button id="confirmation-start-over" variant="secondary" onClick={onStartOver}>
          Check another device
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line p-4 last:border-b-0 sm:odd:border-r">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm text-ink">{value}</dd>
    </div>
  );
}
