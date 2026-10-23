import type { MaterialEstimate, TimeToCash } from "./types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatInr(value: number): string {
  return inr.format(value);
}

export function formatDays({ minDays, maxDays }: TimeToCash): string {
  if (minDays === maxDays) return `${minDays} ${minDays === 1 ? "day" : "days"}`;
  return `${minDays} to ${maxDays} days`;
}

export function formatStorage(gb: number): string {
  return gb >= 1024 ? `${gb / 1024} TB` : `${gb} GB`;
}

export function formatMaterial({ amount, unit }: MaterialEstimate): string {
  if (unit === "mg" && amount >= 1000) return `${(amount / 1000).toLocaleString("en-IN")} g`;
  return `${amount.toLocaleString("en-IN")} ${unit}`;
}

export function formatKg(kg: number): string {
  return `${kg.toLocaleString("en-IN", { maximumFractionDigits: 2 })} kg`;
}

export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Local date as YYYY-MM-DD, offset by `days`. */
export function isoDateFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
