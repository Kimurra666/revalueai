"use client";

import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import type { DeviceType } from "@/lib/types";
import type { ConditionKey, DetailsForm } from "@/lib/validation";

const YES_NO = [
  { value: true,  label: "Yes" },
  { value: false, label: "No"  },
];

function questions(
  deviceType: DeviceType,
): { key: ConditionKey; legend: string; hint?: string }[] {
  return [
    { key: "powersOn",          legend: "Does it turn on?" },
    {
      key: "screenCracked",
      legend: "Is the screen cracked?",
      hint: "Include cracks in the corners.",
    },
    {
      key: "batteryHoldsCharge",
      legend: "Does the battery hold a charge?",
      hint:
        deviceType === "phone"
          ? "Lasts at least half a day of normal use."
          : "Lasts at least 2 hours away from the charger.",
    },
    { key: "bodyDamage", legend: "Any dents, bends or broken parts on the body?" },
  ];
}

interface ConditionQuestionsProps {
  deviceType: DeviceType;
  condition: DetailsForm["condition"];
  onChange: (key: ConditionKey, value: boolean) => void;
  errors: Record<string, string>;
}

export function ConditionQuestions({
  deviceType,
  condition,
  onChange,
  errors,
}: ConditionQuestionsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {questions(deviceType).map((q) => (
        <ChoiceGroup<boolean>
          key={q.key}
          name={`condition-${q.key}`}
          legend={q.legend}
          hint={q.hint}
          value={condition[q.key]}
          options={YES_NO}
          onChange={(v) => onChange(q.key, v)}
          error={errors[`condition.${q.key}`]}
        />
      ))}
    </div>
  );
}
