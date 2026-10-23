import type { Accessory, AgeBand, DeviceType, Effort, Pathway, PartnerType, TimeSlot } from "./types";

export const PATHWAY_LABELS: Record<Pathway, string> = {
  reuse: "Reuse",
  refurbish: "Refurbish",
  recycle: "Recycle",
};

export const PATHWAY_SUMMARY: Record<Pathway, string> = {
  reuse: "Sell it as it is",
  refurbish: "Repair it, then sell",
  recycle: "Recover the materials",
};

export const PATHWAY_ORDER: Pathway[] = ["reuse", "refurbish", "recycle"];

export const EFFORT_LABELS: Record<Effort, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  resale: "Resale partner",
  repair: "Repair workshop",
  recycler: "Authorised recycler",
};

export const AGE_OPTIONS: { value: AgeBand; label: string }[] = [
  { value: "under_1", label: "Less than 1 year" },
  { value: "1_2", label: "1 to 2 years" },
  { value: "2_3", label: "2 to 3 years" },
  { value: "3_5", label: "3 to 5 years" },
  { value: "over_5", label: "More than 5 years" },
];

export const BRANDS: Record<DeviceType, string[]> = {
  phone: ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Vivo", "Oppo", "Motorola", "Google", "Other"],
  laptop: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI", "Microsoft", "Other"],
};

export const STORAGE_OPTIONS: Record<DeviceType, number[]> = {
  phone: [32, 64, 128, 256, 512, 1024],
  laptop: [128, 256, 512, 1024, 2048],
};

export const RAM_OPTIONS: Record<DeviceType, number[]> = {
  phone: [2, 3, 4, 6, 8, 12, 16],
  laptop: [4, 8, 16, 32, 64],
};

export const ACCESSORY_OPTIONS: Record<DeviceType, { value: Accessory; label: string }[]> = {
  phone: [
    { value: "charger", label: "Charger" },
    { value: "cable", label: "Cable" },
    { value: "box", label: "Original box" },
    { value: "earphones", label: "Earphones" },
  ],
  laptop: [
    { value: "charger", label: "Charger" },
    { value: "box", label: "Original box" },
    { value: "bag", label: "Bag or sleeve" },
  ],
};

export const CITIES = ["Bengaluru", "Chennai", "Delhi", "Hyderabad", "Kolkata", "Mumbai", "Pune"];

export const SLOT_LABELS: Record<TimeSlot, string> = {
  morning: "Morning, 9 am to 12 pm",
  afternoon: "Afternoon, 12 pm to 4 pm",
  evening: "Evening, 4 pm to 7 pm",
};
