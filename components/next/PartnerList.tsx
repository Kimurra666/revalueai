"use client";

import { Mail, MapPin, Phone, Truck } from "lucide-react";
import { FieldError } from "@/components/ui/Field";
import { PARTNER_TYPE_LABELS } from "@/lib/options";
import type { Partner } from "@/lib/types";

interface PartnerListProps {
  partners: Partner[];
  selectedId: string;
  onSelect: (partner: Partner) => void;
  error?: string;
}

/** Radio list of partners. The first radio has id `partner-first` so validation can focus it. */
export function PartnerList({ partners, selectedId, onSelect, error }: PartnerListProps) {
  return (
    <fieldset aria-describedby={error ? "partnerId-error" : undefined} className="flex flex-col gap-2">
      <legend className="sr-only">Choose a partner</legend>
      <ul className="flex flex-col gap-2">
        {partners.map((p, i) => {
          const selected = p.id === selectedId;
          const id       = i === 0 ? "partner-first" : `partner-${p.id}`;
          return (
            <li key={p.id}>
              <label
                htmlFor={id}
                className={[
                  "flex cursor-pointer gap-3 rounded-sm border bg-white p-4",
                  "transition-colors duration-150",
                  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
                  selected
                    ? "border-primary bg-primary-tint ring-1 ring-primary"
                    : error
                      ? "border-danger hover:border-line-strong"
                      : "border-line hover:border-line-strong",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  id={id}
                  type="radio"
                  name="partner"
                  value={p.id}
                  checked={selected}
                  onChange={() => onSelect(p)}
                  className="sr-only"
                />

                {/* Radio dot */}
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? "border-primary" : "border-muted"
                  }`}
                  aria-hidden
                >
                  {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>

                {/* Content */}
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  {/* Name row + pickup tag */}
                  <span className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                    <span>
                      <span className="block text-sm font-medium text-ink">{p.name}</span>
                      <span className="block text-xs text-muted">{PARTNER_TYPE_LABELS[p.type]}</span>
                    </span>
                    {/* Pickup / drop-off tag */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs ${
                        p.offersPickup
                          ? "bg-primary-tint text-primary-dark"
                          : "bg-surface text-muted"
                      }`}
                    >
                      <Truck className="h-3 w-3 shrink-0" aria-hidden />
                      {p.offersPickup ? "Pickup available" : "Drop-off only"}
                    </span>
                  </span>

                  {/* Contact details */}
                  <span className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-5">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                      <MapPin className="h-3 w-3 shrink-0 text-muted" aria-hidden />
                      {p.area}, {p.city}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                      <Phone className="h-3 w-3 shrink-0 text-muted" aria-hidden />
                      {p.phone}
                    </span>
                    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted">
                      <Mail className="h-3 w-3 shrink-0 text-muted" aria-hidden />
                      <span className="truncate">{p.email}</span>
                    </span>
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <FieldError id="partnerId" error={error} />
    </fieldset>
  );
}
