"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Alert, ErrorSummary } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { describedBy, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Section, StepHeading } from "@/components/ui/StepHeading";
import { ApiError, getPartners, requestPickup } from "@/lib/api";
import { formatInr, isoDateFromToday } from "@/lib/format";
import { CITIES, PATHWAY_LABELS, SLOT_LABELS } from "@/lib/options";
import type { HandoverMethod, Partner, PathwayOption, PickupConfirmation, TimeSlot } from "@/lib/types";
import { normalisePhone, validatePickup, type FormErrors, type PickupForm } from "@/lib/validation";
import { PartnerList } from "./PartnerList";

const METHOD_OPTIONS: { value: HandoverMethod; label: string }[] = [
  { value: "pickup",  label: "Pickup from me"    },
  { value: "dropoff", label: "I will drop it off" },
];

const EMPTY_PICKUP_FORM: PickupForm = {
  partnerId:     "",
  method:        "pickup",
  name:          "",
  phone:         "",
  address:       "",
  preferredDate: "",
  preferredSlot: "",
};

/** Maps an error key to the id of the element that should receive focus. */
function elementIdFor(key: string): string {
  return (
    {
      partnerId:     "partner-first",
      method:        "method-pickup",
      preferredDate: "date",
      preferredSlot: "slot",
    }[key] ?? key
  );
}

type PartnersState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; partners: Partner[] };

interface NextStepProps {
  submissionId: string;
  option: PathwayOption;
  onBack: () => void;
  onConfirmed: (confirmation: PickupConfirmation, partner: Partner) => void;
}

export function NextStep({ submissionId, option, onBack, onConfirmed }: NextStepProps) {
  const pathway      = option.pathway;
  const pathwayLabel = PATHWAY_LABELS[pathway].toLowerCase();

  const [city, setCity]                   = useState("");
  const [partnersAttempt, setPartnersAttempt] = useState(0);
  const [partnersState, setPartnersState] = useState<PartnersState>({ status: "loading" });

  const [form, setForm]               = useState<PickupForm>(EMPTY_PICKUP_FORM);
  const [attempted, setAttempted]     = useState(false);
  const [serverErrors, setServerErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const minDate = useMemo(() => isoDateFromToday(1),  []);
  const maxDate = useMemo(() => isoDateFromToday(30), []);

  /* ---------- Load partners ---------- */
  useEffect(() => {
    let cancelled = false;
    setPartnersState({ status: "loading" });
    getPartners({ pathway, city: city || undefined })
      .then((partners) => {
        if (cancelled) return;
        setPartnersState({ status: "ready", partners });
        // Drop the selection if that partner is no longer in the list.
        setForm((f) => (partners.some((p) => p.id === f.partnerId) ? f : { ...f, partnerId: "" }));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPartnersState({
          status:  "error",
          message: err instanceof ApiError ? err.message : "We could not load partners right now.",
        });
      });
    return () => { cancelled = true; };
  }, [pathway, city, partnersAttempt]);

  const partners       = partnersState.status === "ready" ? partnersState.partners : [];
  const selectedPartner = partners.find((p) => p.id === form.partnerId) ?? null;
  const pickupAllowed  = selectedPartner ? selectedPartner.offersPickup : true;

  const errors = useMemo<FormErrors>(
    () => ({ ...(attempted ? validatePickup(form, minDate) : {}), ...serverErrors }),
    [attempted, form, minDate, serverErrors],
  );
  const errorCount = Object.keys(errors).length;

  const set = <K extends keyof PickupForm>(key: K, value: PickupForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (serverErrors[key]) {
      setServerErrors(({ [key]: _removed, ...rest }) => rest);
    }
  };

  const selectPartner = (p: Partner) =>
    setForm((f) => ({
      ...f,
      partnerId: p.id,
      // Partners without pickup can only accept drop-offs.
      method: p.offersPickup ? f.method : "dropoff",
    }));

  /* ---------- Submit ---------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    setServerErrors({});
    setSubmitError(null);

    const found = validatePickup(form, minDate);
    const first = Object.keys(found)[0];
    if (first) {
      const el = document.getElementById(elementIdFor(first));
      el?.focus({ preventScroll: true });
      (el?.closest("fieldset, div") ?? el)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!selectedPartner) return;

    setSubmitting(true);
    try {
      const confirmation = await requestPickup({
        submissionId,
        partnerId:     form.partnerId,
        pathway,
        method:        form.method,
        name:          form.name.trim(),
        phone:         normalisePhone(form.phone),
        address:       form.method === "pickup" ? form.address.trim() : "",
        preferredDate: form.preferredDate,
        preferredSlot: form.preferredSlot as TimeSlot,
      });
      onConfirmed(confirmation, selectedPartner);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.fields) setServerErrors(err.fields);
        setSubmitError(err.message);
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-4">
        <Button id="next-back" variant="text" onClick={onBack} className="self-start">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to options
        </Button>
        <StepHeading title={`Book a partner to ${pathwayLabel} your device`}>
          Choose a partner near you and tell them when to collect it. They will call you to confirm.
        </StepHeading>
      </div>

      {/* ── Selected option summary bar ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 rounded-sm border border-line bg-surface px-4 py-2.5 text-sm">
        <span>
          <span className="text-muted">Option </span>
          <span className="font-medium text-ink">{PATHWAY_LABELS[pathway]}</span>
        </span>
        <span>
          <span className="text-muted">Estimated </span>
          <span className="tabular-nums font-medium text-ink">{formatInr(option.estimatedValueInr)}</span>
        </span>
      </div>

      {/* Error summary — only after a failed submit */}
      {attempted && errorCount > 0 && (
        <ErrorSummary errors={errors} idFor={elementIdFor} />
      )}

      {/* ── Partners ────────────────────────────────────────────────── */}
      <Section title="Partner" description="All partners are checked before they are listed.">
        <div className="sm:max-w-xs">
          <Field id="city" label="City">
            <Select id="city" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All cities</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div aria-live="polite" aria-busy={partnersState.status === "loading"}>
          {/* Skeleton rows while loading */}
          {partnersState.status === "loading" && (
            <ul className="flex flex-col gap-2" aria-label="Loading partners">
              {[1, 2, 3].map((n) => (
                <li
                  key={n}
                  className="h-24 rounded-sm border border-line bg-surface animate-pulse"
                  aria-hidden
                />
              ))}
            </ul>
          )}

          {partnersState.status === "error" && (
            <Alert
              tone="error"
              title="Partners could not be loaded"
              action={
                <Button
                  id="partners-retry"
                  variant="secondary"
                  onClick={() => setPartnersAttempt((a) => a + 1)}
                >
                  Try again
                </Button>
              }
            >
              {partnersState.message}
            </Alert>
          )}

          {partnersState.status === "ready" && partners.length === 0 && (
            <Alert
              tone="info"
              title={city ? `No partners in ${city} yet` : "No partners available yet"}
            >
              {city
                ? "Try another city, or choose All cities to see every partner."
                : `We do not have a partner to ${pathwayLabel} this device right now. Go back and choose another option.`}
            </Alert>
          )}

          {partnersState.status === "ready" && partners.length > 0 && (
            <PartnerList
              partners={partners}
              selectedId={form.partnerId}
              onSelect={selectPartner}
              error={errors.partnerId}
            />
          )}
        </div>
      </Section>

      {/* ── Handover ────────────────────────────────────────────────── */}
      <Section title="Handover">
        {/* Method — segmented control */}
        <ChoiceGroup<HandoverMethod>
          name="method"
          legend="How will the partner get the device?"
          hint={pickupAllowed ? undefined : "This partner only accepts drop-offs."}
          value={form.method}
          options={pickupAllowed ? METHOD_OPTIONS : METHOD_OPTIONS.filter((o) => o.value === "dropoff")}
          onChange={(m) => set("method", m)}
          error={errors.method}
        />

        {form.method === "dropoff" && selectedPartner && (
          <p className="text-sm text-muted">
            Drop-off address: {selectedPartner.name}, {selectedPartner.area},{" "}
            {selectedPartner.city}.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Full name" error={errors.name}>
            <Input
              id="name"
              value={form.name}
              autoComplete="name"
              error={errors.name}
              aria-describedby={describedBy("name", errors.name)}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>

          <Field
            id="phone"
            label="Mobile number"
            hint="10 digits. The partner will call to confirm."
            error={errors.phone}
          >
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={form.phone}
              error={errors.phone}
              aria-describedby={describedBy("phone", errors.phone, "hint")}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>

          {form.method === "pickup" && (
            <div className="sm:col-span-2">
              <Field
                id="address"
                label="Pickup address"
                hint="House or flat number, street, area and pincode."
                error={errors.address}
              >
                <Textarea
                  id="address"
                  rows={3}
                  autoComplete="street-address"
                  value={form.address}
                  error={errors.address}
                  aria-describedby={describedBy("address", errors.address, "hint")}
                  onChange={(e) => set("address", e.target.value)}
                />
              </Field>
            </div>
          )}

          {/* Date + Time side by side on desktop */}
          <Field id="date" label="Preferred date" error={errors.preferredDate}>
            <Input
              id="date"
              type="date"
              min={minDate}
              max={maxDate}
              value={form.preferredDate}
              error={errors.preferredDate}
              aria-describedby={describedBy("date", errors.preferredDate)}
              onChange={(e) => set("preferredDate", e.target.value)}
            />
          </Field>

          <Field id="slot" label="Preferred time" error={errors.preferredSlot}>
            <Select
              id="slot"
              value={form.preferredSlot}
              error={errors.preferredSlot}
              aria-describedby={describedBy("slot", errors.preferredSlot)}
              onChange={(e) => set("preferredSlot", e.target.value as TimeSlot | "")}
            >
              <option value="">Choose time</option>
              {(Object.keys(SLOT_LABELS) as TimeSlot[]).map((s) => (
                <option key={s} value={s}>{SLOT_LABELS[s]}</option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      {/* ── Submit ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-t border-line pt-6">
        {submitError && (
          <Alert tone="error" title="Your request was not sent">
            {submitError}
          </Alert>
        )}
        <Button
          id="pickup-submit"
          type="submit"
          loading={submitting}
          className="w-full sm:w-auto sm:self-start"
        >
          {submitting
            ? "Sending request"
            : form.method === "pickup"
              ? "Request pickup"
              : "Request drop-off"}
        </Button>
        <p className="text-xs text-muted">
          Your name, number and address are shared only with the partner you choose.
        </p>
      </div>
    </form>
  );
}
