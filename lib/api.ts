/**
 * Single entry point for all backend calls.
 *
 * NEXT_PUBLIC_USE_MOCKS !== "false"  -> returns data from /mocks after a short delay.
 * NEXT_PUBLIC_USE_MOCKS === "false"  -> calls the real backend at NEXT_PUBLIC_API_BASE_URL.
 *
 * Shapes are defined in ./types.ts and documented in /docs/api-contract.md.
 */
import { MOCK_PARTNERS } from "@/mocks/partners";
import { SCENARIOS, type ScenarioId } from "@/mocks/scenarios";
import { readDevSettings } from "./devSettings";
import type {
  AnalysisResult,
  ApiErrorBody,
  DeviceDetails,
  GetPartnersRequest,
  GetPartnersResponse,
  Partner,
  PickupConfirmation,
  PickupRequest,
  SubmitDeviceRequest,
  SubmitDeviceResponse,
} from "./types";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string = "unknown_error",
    public status: number = 0,
    public fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/** Upload photos and device details. Returns an id used by the other calls. */
export async function submitDevice(req: SubmitDeviceRequest): Promise<SubmitDeviceResponse> {
  if (USE_MOCKS) return mockSubmitDevice(req);

  const body = new FormData();
  body.append("details", JSON.stringify(req.details));
  body.append("front", req.photos.front);
  body.append("back", req.photos.back);
  if (req.photos.screenOn) body.append("screenOn", req.photos.screenOn);

  return request<SubmitDeviceResponse>("/api/devices", { method: "POST", body });
}

/** Run the valuation for a submitted device. */
export async function analyseDevice(submissionId: string): Promise<AnalysisResult> {
  if (USE_MOCKS) return mockAnalyseDevice(submissionId);
  return request<AnalysisResult>(`/api/devices/${encodeURIComponent(submissionId)}/analysis`, {
    method: "POST",
  });
}

/** Partners that handle the chosen pathway, optionally filtered by city. */
export async function getPartners(req: GetPartnersRequest): Promise<Partner[]> {
  if (USE_MOCKS) return mockGetPartners(req);
  const params = new URLSearchParams({ pathway: req.pathway });
  if (req.city) params.set("city", req.city);
  const res = await request<GetPartnersResponse>(`/api/partners?${params.toString()}`);
  return res.partners;
}

/** Book a pickup or drop-off with a partner. */
export async function requestPickup(req: PickupRequest): Promise<PickupConfirmation> {
  if (USE_MOCKS) return mockRequestPickup(req);
  return request<PickupConfirmation>("/api/pickups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
}

/* ------------------------------------------------------------------ */
/* Real HTTP                                                           */
/* ------------------------------------------------------------------ */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection and try again.", "network_error");
  }

  if (!res.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(
      body?.error?.message ?? "Something went wrong. Please try again.",
      body?.error?.code ?? "http_error",
      res.status,
      body?.error?.fields,
    );
  }

  return (await res.json()) as T;
}

/* ------------------------------------------------------------------ */
/* Mocks                                                               */
/* ------------------------------------------------------------------ */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** In-memory store so the mock analysis can see what was submitted. */
const mockSubmissions = new Map<string, DeviceDetails>();

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

async function mockSubmitDevice(req: SubmitDeviceRequest): Promise<SubmitDeviceResponse> {
  await delay(600);
  const submissionId = makeId("sub");
  mockSubmissions.set(submissionId, req.details);
  return { submissionId, receivedAt: new Date().toISOString() };
}

function pickScenario(details: DeviceDetails | undefined): ScenarioId {
  const setting = readDevSettings().scenario;
  if (setting !== "auto") return setting;
  if (!details) return "working-phone";
  if (!details.condition.powersOn) return "dead-laptop";
  if (details.condition.screenCracked || details.condition.bodyDamage) return "cracked-phone";
  return "working-phone";
}

async function mockAnalyseDevice(submissionId: string): Promise<AnalysisResult> {
  await delay(4200);
  if (readDevSettings().failAnalysis) {
    throw new ApiError("We could not finish checking your device. Please try again.", "analysis_failed", 500);
  }
  const scenario = SCENARIOS[pickScenario(mockSubmissions.get(submissionId))];
  return { submissionId, ...structuredClone(scenario) };
}

async function mockGetPartners(req: GetPartnersRequest): Promise<Partner[]> {
  await delay(500);
  const settings = readDevSettings();
  if (settings.failPartners) {
    throw new ApiError("We could not load partners right now.", "partners_unavailable", 503);
  }
  if (settings.emptyPartners) return [];
  return MOCK_PARTNERS.filter(
    (p) => p.pathways.includes(req.pathway) && (!req.city || p.city === req.city),
  );
}

async function mockRequestPickup(req: PickupRequest): Promise<PickupConfirmation> {
  await delay(900);
  if (readDevSettings().failPickup) {
    throw new ApiError("Your request could not be sent. Please try again.", "pickup_failed", 500);
  }
  const partner = MOCK_PARTNERS.find((p) => p.id === req.partnerId);
  if (!partner) throw new ApiError("That partner is no longer available.", "partner_not_found", 404);
  return {
    requestId: `RV-${Math.floor(100000 + Math.random() * 900000)}`,
    status: "received",
    partnerId: partner.id,
    partnerName: partner.name,
    method: req.method,
    preferredDate: req.preferredDate,
    preferredSlot: req.preferredSlot,
    createdAt: new Date().toISOString(),
  };
}
