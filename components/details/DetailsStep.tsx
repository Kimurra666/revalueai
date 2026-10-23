"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ErrorSummary } from "@/components/ui/Alert";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { describedBy, Field, Input, Select } from "@/components/ui/Field";
import { Section, StepHeading } from "@/components/ui/StepHeading";
import { formatStorage } from "@/lib/format";
import { ACCESSORY_OPTIONS, AGE_OPTIONS, BRANDS, RAM_OPTIONS, STORAGE_OPTIONS } from "@/lib/options";
import type { Accessory, AgeBand, DeviceType } from "@/lib/types";
import { validateDetails, type DetailsForm } from "@/lib/validation";
import { ConditionQuestions } from "./ConditionQuestions";
import { PhotoUpload } from "./PhotoUpload";

const DEVICE_TYPES: { value: DeviceType; label: string }[] = [
  { value: "phone",  label: "Phone"  },
  { value: "laptop", label: "Laptop" },
];

/** Maps an error key to the id of the element that should receive focus. */
function elementIdFor(key: string): string {
  if (key.startsWith("photos."))    return `photo-${key.split(".")[1]}`;
  if (key.startsWith("condition.")) return `condition-${key.split(".")[1]}-true`;
  return { ageBand: "age", storageGb: "storage", ramGb: "ram" }[key] ?? key;
}

interface DetailsStepProps {
  form: DetailsForm;
  onChange: (form: DetailsForm) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
}

export function DetailsStep({
  form,
  onChange,
  onSubmit,
  submitting,
  submitError,
}: DetailsStepProps) {
  const [attempted, setAttempted] = useState(false);
  const errors     = useMemo(() => (attempted ? validateDetails(form) : {}), [attempted, form]);
  const errorCount = Object.keys(errors).length;

  const set = <K extends keyof DetailsForm>(key: K, value: DetailsForm[K]) =>
    onChange({ ...form, [key]: value });

  const changeDeviceType = (deviceType: DeviceType) => {
    if (deviceType === form.deviceType) return;
    onChange({
      ...form,
      deviceType,
      brand:      BRANDS[deviceType].includes(form.brand) ? form.brand : "",
      storageGb:  STORAGE_OPTIONS[deviceType].includes(Number(form.storageGb)) ? form.storageGb : "",
      ramGb:      RAM_OPTIONS[deviceType].includes(Number(form.ramGb)) ? form.ramGb : "",
      accessories: form.accessories.filter((a) =>
        ACCESSORY_OPTIONS[deviceType].some((o) => o.value === a),
      ),
    });
  };

  const toggleAccessory = (a: Accessory) =>
    set(
      "accessories",
      form.accessories.includes(a)
        ? form.accessories.filter((x) => x !== a)
        : [...form.accessories, a],
    );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    const found = validateDetails(form);
    const first = Object.keys(found)[0];
    if (first) {
      const el = document.getElementById(elementIdFor(first));
      el?.focus({ preventScroll: true });
      (el?.closest("fieldset, div") ?? el)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onSubmit();
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8 animate-fade-in">
      <StepHeading title="Tell us about your device">
        Add a few photos and answer some questions. We will compare what you could get from
        selling, repairing or recycling it.
      </StepHeading>

      {/* Error summary — only shown after a failed submit */}
      {attempted && errorCount > 0 && (
        <ErrorSummary errors={errors} idFor={elementIdFor} />
      )}

      {/* ── Photos ─────────────────────────────────────────────────────── */}
      <Section title="Photos" description="Clear photos in good light give a more accurate estimate.">
        <PhotoUpload
          photos={form.photos}
          errors={errors}
          onChange={(slot, file) => set("photos", { ...form.photos, [slot]: file })}
        />
      </Section>

      {/* ── Device ─────────────────────────────────────────────────────── */}
      <Section title="Device">
        <ChoiceGroup<DeviceType>
          name="device-type"
          legend="Device type"
          value={form.deviceType}
          options={DEVICE_TYPES}
          onChange={changeDeviceType}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="brand" label="Brand" error={errors.brand}>
            <Select
              id="brand"
              value={form.brand}
              error={errors.brand}
              aria-describedby={describedBy("brand", errors.brand)}
              onChange={(e) => set("brand", e.target.value)}
            >
              <option value="">Choose brand</option>
              {BRANDS[form.deviceType].map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </Select>
          </Field>

          <Field
            id="model"
            label="Model"
            hint={
              form.deviceType === "phone"
                ? "For example, Galaxy S21 or iPhone 12"
                : "For example, Inspiron 15 3511"
            }
            error={errors.model}
          >
            <Input
              id="model"
              value={form.model}
              autoComplete="off"
              error={errors.model}
              aria-describedby={describedBy("model", errors.model, "hint")}
              onChange={(e) => set("model", e.target.value)}
            />
          </Field>

          <Field id="age" label="Age" error={errors.ageBand}>
            <Select
              id="age"
              value={form.ageBand}
              error={errors.ageBand}
              aria-describedby={describedBy("age", errors.ageBand)}
              onChange={(e) => set("ageBand", e.target.value as AgeBand | "")}
            >
              <option value="">Choose age</option>
              {AGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </Field>

          {/* Storage + RAM — full columns on their own row so labels never wrap */}
          <div className="col-span-full grid grid-cols-2 gap-4 sm:col-auto sm:col-span-1 sm:col-start-1 sm:grid-cols-2">
            <Field id="storage" label="Storage" error={errors.storageGb}>
              <Select
                id="storage"
                value={form.storageGb}
                error={errors.storageGb}
                aria-describedby={describedBy("storage", errors.storageGb)}
                onChange={(e) => set("storageGb", e.target.value)}
              >
                <option value="">Choose</option>
                {STORAGE_OPTIONS[form.deviceType].map((gb) => (
                  <option key={gb} value={gb}>{formatStorage(gb)}</option>
                ))}
              </Select>
            </Field>

            <Field id="ram" label="RAM" error={errors.ramGb}>
              <Select
                id="ram"
                value={form.ramGb}
                error={errors.ramGb}
                aria-describedby={describedBy("ram", errors.ramGb)}
                onChange={(e) => set("ramGb", e.target.value)}
              >
                <option value="">Choose</option>
                {RAM_OPTIONS[form.deviceType].map((gb) => (
                  <option key={gb} value={gb}>{gb} GB</option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        {/* Accessories */}
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-ink">
            Accessories included{" "}
            <span className="font-normal text-muted">(optional)</span>
          </legend>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {ACCESSORY_OPTIONS[form.deviceType].map((o) => (
              <label
                key={o.value}
                htmlFor={`acc-${o.value}`}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  id={`acc-${o.value}`}
                  type="checkbox"
                  className="h-4 w-4"
                  checked={form.accessories.includes(o.value)}
                  onChange={() => toggleAccessory(o.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      </Section>

      {/* ── Condition ──────────────────────────────────────────────────── */}
      <Section
        title="Condition"
        description="Answer as honestly as you can. Partners check the device at handover."
      >
        <ConditionQuestions
          deviceType={form.deviceType}
          condition={form.condition}
          errors={errors}
          onChange={(key, value) => set("condition", { ...form.condition, [key]: value })}
        />
      </Section>

      {/* ── Submit ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-t border-line pt-6">
        {submitError && (
          <Alert tone="error" title="We could not send your details">
            {submitError}
          </Alert>
        )}
        <Button
          id="check-device"
          type="submit"
          loading={submitting}
          className="w-full sm:w-auto sm:self-start"
        >
          {submitting ? "Sending details" : "Check my device"}
        </Button>
        <p className="text-xs text-muted">
          Takes about 10 seconds. Nothing is shared with partners until you choose to.
        </p>
      </div>
    </form>
  );
}
