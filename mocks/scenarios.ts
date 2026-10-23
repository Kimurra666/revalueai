import type { AnalysisResult } from "@/lib/types";

export type ScenarioId = "working-phone" | "cracked-phone" | "dead-laptop";

export const SCENARIO_LABELS: Record<ScenarioId, string> = {
  "working-phone": "Working phone (reuse wins)",
  "cracked-phone": "Cracked-screen phone (refurbish wins)",
  "dead-laptop": "Dead laptop (recycle wins)",
};

/** Analysis results without submissionId; the mock API fills that in. */
export const SCENARIOS: Record<ScenarioId, Omit<AnalysisResult, "submissionId">> = {
  "working-phone": {
    conditionGrade: "A",
    confidence: 0.88,
    recommendedPathway: "reuse",
    options: [
      {
        pathway: "reuse",
        estimatedValueInr: 14500,
        effort: "low",
        timeToCash: { minDays: 1, maxDays: 3 },
        destination: "Sold as it is to a new owner through a resale partner.",
        reasoning:
          "It works well and has no damage. Selling it as it is gets you the most money for the least effort.",
      },
      {
        pathway: "refurbish",
        estimatedValueInr: 13200,
        effort: "medium",
        timeToCash: { minDays: 5, maxDays: 9 },
        destination: "Cleaned and given a new battery by a repair partner, then resold.",
        reasoning: "A new battery adds little to the price once the repair cost is taken off.",
      },
      {
        pathway: "recycle",
        estimatedValueInr: 420,
        effort: "low",
        timeToCash: { minDays: 2, maxDays: 5 },
        destination: "Taken apart by an authorised recycler to recover metals.",
        reasoning: "Recycling a working phone returns very little and ends its useful life early.",
      },
    ],
    impact: {
      kgDiverted: 0.19,
      materials: [
        { material: "Copper", amount: 15, unit: "g" },
        { material: "Silver", amount: 340, unit: "mg" },
        { material: "Gold", amount: 34, unit: "mg" },
        { material: "Palladium", amount: 15, unit: "mg" },
      ],
    },
  },

  "cracked-phone": {
    conditionGrade: "C",
    confidence: 0.79,
    recommendedPathway: "refurbish",
    options: [
      {
        pathway: "reuse",
        estimatedValueInr: 5500,
        effort: "low",
        timeToCash: { minDays: 2, maxDays: 4 },
        destination: "Sold as it is, with the cracked screen, through a resale partner.",
        reasoning: "Buyers pay much less for a cracked screen, even when the rest of the phone works.",
      },
      {
        pathway: "refurbish",
        estimatedValueInr: 11000,
        effort: "medium",
        timeToCash: { minDays: 6, maxDays: 10 },
        destination: "Screen replaced by a repair partner, then resold.",
        reasoning:
          "A new screen costs about ₹3,500 and roughly doubles what the phone sells for.",
      },
      {
        pathway: "recycle",
        estimatedValueInr: 380,
        effort: "low",
        timeToCash: { minDays: 2, maxDays: 5 },
        destination: "Taken apart by an authorised recycler to recover metals.",
        reasoning: "The phone still works, so recycling returns far less than repairing it.",
      },
    ],
    impact: {
      kgDiverted: 0.18,
      materials: [
        { material: "Copper", amount: 14, unit: "g" },
        { material: "Silver", amount: 320, unit: "mg" },
        { material: "Gold", amount: 32, unit: "mg" },
        { material: "Palladium", amount: 14, unit: "mg" },
      ],
    },
  },

  "dead-laptop": {
    conditionGrade: "D",
    confidence: 0.72,
    recommendedPathway: "recycle",
    options: [
      {
        pathway: "reuse",
        estimatedValueInr: 1200,
        effort: "high",
        timeToCash: { minDays: 7, maxDays: 14 },
        destination: "Sold as not working to a buyer who strips it for parts.",
        reasoning: "Few buyers want a laptop that does not turn on, so a sale can take a long time.",
      },
      {
        pathway: "refurbish",
        estimatedValueInr: 900,
        effort: "high",
        timeToCash: { minDays: 14, maxDays: 21 },
        destination: "Board-level repair by a repair partner, then resold.",
        reasoning: "The repair would cost almost as much as the laptop is worth afterwards.",
      },
      {
        pathway: "recycle",
        estimatedValueInr: 1850,
        effort: "low",
        timeToCash: { minDays: 3, maxDays: 5 },
        destination: "Taken apart by an authorised recycler. The battery is handled separately.",
        reasoning:
          "An authorised recycler pays more than a repair would return, and disposes of the battery safely.",
      },
    ],
    impact: {
      kgDiverted: 2.1,
      materials: [
        { material: "Aluminium", amount: 320, unit: "g" },
        { material: "Copper", amount: 160, unit: "g" },
        { material: "Silver", amount: 1000, unit: "mg" },
        { material: "Gold", amount: 220, unit: "mg" },
      ],
    },
  },
};
