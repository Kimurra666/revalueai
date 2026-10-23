import type { ScenarioId } from "@/mocks/scenarios";

/**
 * Developer-only settings that steer the mock API.
 * Stored in localStorage so they survive reloads.
 */
export type ScenarioSetting = "auto" | ScenarioId;

export interface DevSettings {
  /** "auto" picks a scenario from the form answers. */
  scenario: ScenarioSetting;
  failAnalysis: boolean;
  failPartners: boolean;
  emptyPartners: boolean;
  failPickup: boolean;
}

const STORAGE_KEY = "revalueai.devSettings";

export const DEFAULT_DEV_SETTINGS: DevSettings = {
  scenario: "auto",
  failAnalysis: false,
  failPartners: false,
  emptyPartners: false,
  failPickup: false,
};

export function readDevSettings(): DevSettings {
  if (typeof window === "undefined") return DEFAULT_DEV_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DEV_SETTINGS;
    return { ...DEFAULT_DEV_SETTINGS, ...(JSON.parse(raw) as Partial<DevSettings>) };
  } catch {
    return DEFAULT_DEV_SETTINGS;
  }
}

export function writeDevSettings(settings: DevSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const SHOW_DEV_TOGGLE =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_DEV_TOGGLE === "true";
