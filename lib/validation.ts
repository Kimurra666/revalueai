import type {
  Accessory,
  AgeBand,
  DeviceCondition,
  DeviceDetails,
  DevicePhotos,
  DeviceType,
  HandoverMethod,
  PhotoSlot,
  TimeSlot,
} from "./types";

/* ---------------- Device details form ---------------- */

export type ConditionKey = keyof DeviceCondition;

export interface DetailsForm {
  deviceType: DeviceType;
  brand: string;
  model: string;
  ageBand: AgeBand | "";
  storageGb: string;
  ramGb: string;
  accessories: Accessory[];
  condition: Record<ConditionKey, boolean | null>;
  photos: Record<PhotoSlot, File | null>;
}

export const EMPTY_DETAILS_FORM: DetailsForm = {
  deviceType: "phone",
  brand: "",
  model: "",
  ageBand: "",
  storageGb: "",
  ramGb: "",
  accessories: [],
  condition: { powersOn: null, screenCracked: null, batteryHoldsCharge: null, bodyDamage: null },
  photos: { front: null, back: null, screenOn: null },
};

export type FormErrors = Record<string, string>;

export function validateDetails(form: DetailsForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.photos.front) errors["photos.front"] = "Add a photo of the front.";
  if (!form.photos.back) errors["photos.back"] = "Add a photo of the back.";
  if (!form.brand) errors.brand = "Choose a brand.";
  if (!form.model.trim()) errors.model = "Enter the model name.";
  else if (form.model.trim().length < 2) errors.model = "Model name looks too short.";
  if (!form.ageBand) errors.ageBand = "Choose how old the device is.";
  if (!form.storageGb) errors.storageGb = "Choose the storage size.";
  if (!form.ramGb) errors.ramGb = "Choose the RAM size.";
  (Object.keys(form.condition) as ConditionKey[]).forEach((key) => {
    if (form.condition[key] === null) errors[`condition.${key}`] = "Choose yes or no.";
  });
  return errors;
}

export function toSubmission(form: DetailsForm): { details: DeviceDetails; photos: DevicePhotos } {
  return {
    details: {
      deviceType: form.deviceType,
      brand: form.brand,
      model: form.model.trim(),
      ageBand: form.ageBand as AgeBand,
      storageGb: Number(form.storageGb),
      ramGb: Number(form.ramGb),
      accessories: form.accessories,
      condition: {
        powersOn: Boolean(form.condition.powersOn),
        screenCracked: Boolean(form.condition.screenCracked),
        batteryHoldsCharge: Boolean(form.condition.batteryHoldsCharge),
        bodyDamage: Boolean(form.condition.bodyDamage),
      },
    },
    photos: {
      front: form.photos.front as File,
      back: form.photos.back as File,
      screenOn: form.photos.screenOn,
    },
  };
}

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export function validatePhoto(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Choose an image file (JPG, PNG or HEIC).";
  if (file.size > MAX_PHOTO_BYTES) return "This photo is larger than 10 MB. Choose a smaller one.";
  return null;
}

/* ---------------- Pickup form ---------------- */

export interface PickupForm {
  partnerId: string;
  method: HandoverMethod;
  name: string;
  phone: string;
  address: string;
  preferredDate: string;
  preferredSlot: TimeSlot | "";
}

export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
}

export function validatePickup(form: PickupForm, minDate: string): FormErrors {
  const errors: FormErrors = {};
  if (!form.partnerId) errors.partnerId = "Choose a partner from the list above.";
  if (form.name.trim().length < 2) errors.name = "Enter your full name.";
  if (!/^[6-9]\d{9}$/.test(normalisePhone(form.phone)))
    errors.phone = "Enter a 10-digit mobile number.";
  if (form.method === "pickup" && form.address.trim().length < 10)
    errors.address = "Enter the full pickup address, including area and pincode.";
  if (!form.preferredDate) errors.preferredDate = "Choose a date.";
  else if (form.preferredDate < minDate) errors.preferredDate = "Choose a date from tomorrow onwards.";
  if (!form.preferredSlot) errors.preferredSlot = "Choose a time.";
  return errors;
}
