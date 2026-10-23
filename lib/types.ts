/**
 * Request/response contract between the ReValueAI frontend and backend.
 * Keep in sync with /docs/api-contract.md. The backend must return JSON
 * that matches these shapes exactly (camelCase keys).
 */

export type DeviceType = "phone" | "laptop";
export type Pathway = "reuse" | "refurbish" | "recycle";
export type Effort = "low" | "medium" | "high";
export type ConditionGrade = "A" | "B" | "C" | "D";
export type AgeBand = "under_1" | "1_2" | "2_3" | "3_5" | "over_5";
export type Accessory = "charger" | "cable" | "box" | "earphones" | "bag";
export type PhotoSlot = "front" | "back" | "screenOn";

export interface DeviceCondition {
  powersOn: boolean;
  screenCracked: boolean;
  batteryHoldsCharge: boolean;
  bodyDamage: boolean;
}

export interface DeviceDetails {
  deviceType: DeviceType;
  brand: string;
  model: string;
  ageBand: AgeBand;
  /** Internal storage in GB. */
  storageGb: number;
  /** RAM in GB. */
  ramGb: number;
  accessories: Accessory[];
  condition: DeviceCondition;
}

export interface DevicePhotos {
  front: File;
  back: File;
  /** Optional. Only meaningful if the device powers on. */
  screenOn?: File | null;
}

/* ---------- POST /api/devices ---------- */

export interface SubmitDeviceRequest {
  details: DeviceDetails;
  photos: DevicePhotos;
}

export interface SubmitDeviceResponse {
  submissionId: string;
  /** ISO 8601 timestamp. */
  receivedAt: string;
}

/* ---------- POST /api/devices/{submissionId}/analysis ---------- */

export interface TimeToCash {
  minDays: number;
  maxDays: number;
}

export interface PathwayOption {
  pathway: Pathway;
  /** Net amount the owner can expect, in whole rupees, after repair/transport costs. */
  estimatedValueInr: number;
  effort: Effort;
  timeToCash: TimeToCash;
  /** Plain sentence describing where the device ends up. */
  destination: string;
  /** 1-2 short plain-language sentences. */
  reasoning: string;
}

export interface MaterialEstimate {
  material: string;
  amount: number;
  unit: "g" | "mg";
}

export interface ImpactSummary {
  kgDiverted: number;
  materials: MaterialEstimate[];
}

export interface AnalysisResult {
  submissionId: string;
  conditionGrade: ConditionGrade;
  /** 0 to 1. */
  confidence: number;
  /** Exactly three entries, one per pathway. */
  options: PathwayOption[];
  recommendedPathway: Pathway;
  impact: ImpactSummary;
}

/* ---------- GET /api/partners ---------- */

export type PartnerType = "resale" | "repair" | "recycler";

export interface GetPartnersRequest {
  pathway: Pathway;
  city?: string;
}

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  pathways: Pathway[];
  city: string;
  area: string;
  phone: string;
  email: string;
  offersPickup: boolean;
}

export interface GetPartnersResponse {
  partners: Partner[];
}

/* ---------- POST /api/pickups ---------- */

export type HandoverMethod = "pickup" | "dropoff";
export type TimeSlot = "morning" | "afternoon" | "evening";

export interface PickupRequest {
  submissionId: string;
  partnerId: string;
  pathway: Pathway;
  method: HandoverMethod;
  name: string;
  /** 10-digit Indian mobile number, no country code. */
  phone: string;
  /** Required when method is "pickup". Empty string for "dropoff". */
  address: string;
  /** YYYY-MM-DD. */
  preferredDate: string;
  preferredSlot: TimeSlot;
}

export interface PickupConfirmation {
  requestId: string;
  status: "received";
  partnerId: string;
  partnerName: string;
  method: HandoverMethod;
  preferredDate: string;
  preferredSlot: TimeSlot;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

/* ---------- Errors (all endpoints) ---------- */

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    /** Optional per-field messages for 422 validation errors. */
    fields?: Record<string, string>;
  };
}
