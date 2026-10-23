"use client";

import { Settings2, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DEFAULT_DEV_SETTINGS,
  readDevSettings,
  SHOW_DEV_TOGGLE,
  writeDevSettings,
  type DevSettings,
  type ScenarioSetting,
} from "@/lib/devSettings";
import { SCENARIO_LABELS, type ScenarioId } from "@/mocks/scenarios";

const FLAGS: { key: Exclude<keyof DevSettings, "scenario">; label: string }[] = [
  { key: "failAnalysis",  label: "Fail analysis"      },
  { key: "failPartners",  label: "Fail partner list"  },
  { key: "emptyPartners", label: "No partners found"  },
  { key: "failPickup",    label: "Fail pickup request" },
];

/** Small dev-only panel to switch mock scenarios and simulate failures. */
export function DevScenarioToggle() {
  const [open, setOpen]       = useState(false);
  const [settings, setSettings] = useState<DevSettings>(DEFAULT_DEV_SETTINGS);

  useEffect(() => setSettings(readDevSettings()), []);

  if (!SHOW_DEV_TOGGLE) return null;

  const update = (patch: Partial<DevSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    writeDevSettings(next);
  };

  const active = settings.scenario !== "auto" || FLAGS.some((f) => settings[f.key]);

  return (
    /*
     * Muted chip, bottom-right.
     * Only visible when SHOW_DEV_TOGGLE is true (dev builds or
     * NEXT_PUBLIC_SHOW_DEV_TOGGLE=true).
     */
    <div className="fixed right-3 bottom-3 z-50 text-xs">
      {open ? (
        <div
          id="dev-panel"
          className="w-64 rounded-sm border border-line bg-white p-4 text-xs"
          role="dialog"
          aria-label="Developer settings"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="font-medium text-muted">Mock data</p>
            <button
              id="dev-panel-close"
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-sm p-1 text-muted hover:bg-surface hover:text-ink"
              aria-label="Close developer settings"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <label htmlFor="dev-scenario" className="mb-0.5 block text-muted">
            Scenario
          </label>
          <select
            id="dev-scenario"
            value={settings.scenario}
            onChange={(e) => update({ scenario: e.target.value as ScenarioSetting })}
            className="mb-1 h-8 w-full rounded-sm border border-line bg-white px-2 text-xs"
          >
            <option value="auto">Auto (from form answers)</option>
            {(Object.keys(SCENARIO_LABELS) as ScenarioId[]).map((id) => (
              <option key={id} value={id}>{SCENARIO_LABELS[id]}</option>
            ))}
          </select>
          <p className="mb-3 text-muted">Applies to the next analysis.</p>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1 text-muted">Simulate</legend>
            {FLAGS.map((f) => (
              <label key={f.key} className="flex items-center gap-2 text-muted">
                <input
                  id={`dev-${f.key}`}
                  type="checkbox"
                  checked={settings[f.key]}
                  onChange={(e) => update({ [f.key]: e.target.checked })}
                  className="h-3.5 w-3.5"
                />
                {f.label}
              </label>
            ))}
          </fieldset>

          <button
            id="dev-reset"
            type="button"
            onClick={() => update(DEFAULT_DEV_SETTINGS)}
            className="mt-3 text-primary hover:underline"
          >
            Reset
          </button>
        </div>
      ) : (
        <button
          id="dev-panel-open"
          type="button"
          onClick={() => setOpen(true)}
          className={`flex items-center gap-1 rounded-sm border bg-white px-2 py-1 text-xs hover:bg-surface ${
            active ? "border-warning text-warning" : "border-line text-muted"
          }`}
        >
          <Settings2 className="h-3 w-3" aria-hidden />
          Mock
        </button>
      )}
    </div>
  );
}
