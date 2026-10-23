# ReValueAI API contract

The frontend talks to the backend through the four endpoints below. TypeScript shapes live in
[`lib/types.ts`](../lib/types.ts). Keep the two files in sync.

- All JSON uses **camelCase** keys.
- Money is in **whole rupees** (integer, no paise).
- Dates are `YYYY-MM-DD`. Timestamps are ISO 8601 strings.
- The frontend reads `NEXT_PUBLIC_API_BASE_URL` and prefixes every path with it.
  Set `NEXT_PUBLIC_USE_MOCKS=false` to use the real backend.
- Allow CORS from the frontend origin. All responses are `application/json`.

---

## 1. `POST /api/devices`: submit a device

`multipart/form-data` with these parts:

| Part       | Type       | Required | Notes                                    |
| ---------- | ---------- | -------- | ---------------------------------------- |
| `details`  | JSON text  | yes      | A `DeviceDetails` object (see below)     |
| `front`    | image file | yes      | Max 10 MB                                |
| `back`     | image file | yes      | Max 10 MB                                |
| `screenOn` | image file | no       | Only sent if the user added it           |

`details` example:

```json
{
  "deviceType": "phone",
  "brand": "Samsung",
  "model": "Galaxy S21",
  "ageBand": "2_3",
  "storageGb": 128,
  "ramGb": 8,
  "accessories": ["charger", "box"],
  "condition": {
    "powersOn": true,
    "screenCracked": true,
    "batteryHoldsCharge": true,
    "bodyDamage": false
  }
}
```

Allowed values:

- `deviceType`: `phone` | `laptop`
- `ageBand`: `under_1` | `1_2` | `2_3` | `3_5` | `over_5`
- `accessories[]`: `charger` | `cable` | `box` | `earphones` | `bag`

**201** response:

```json
{ "submissionId": "sub_8f3k2l1q", "receivedAt": "2026-10-21T15:40:12Z" }
```

---

## 2. `POST /api/devices/{submissionId}/analysis`: run the valuation

No body. May take several seconds; the frontend shows progress while waiting.

**200** response:

```json
{
  "submissionId": "sub_8f3k2l1q",
  "conditionGrade": "C",
  "confidence": 0.79,
  "recommendedPathway": "refurbish",
  "options": [
    {
      "pathway": "reuse",
      "estimatedValueInr": 5500,
      "effort": "low",
      "timeToCash": { "minDays": 2, "maxDays": 4 },
      "destination": "Sold as it is, with the cracked screen, through a resale partner.",
      "reasoning": "Buyers pay much less for a cracked screen, even when the rest of the phone works."
    },
    { "pathway": "refurbish", "...": "..." },
    { "pathway": "recycle", "...": "..." }
  ],
  "impact": {
    "kgDiverted": 0.18,
    "materials": [
      { "material": "Copper", "amount": 14, "unit": "g" },
      { "material": "Gold", "amount": 32, "unit": "mg" }
    ]
  }
}
```

Rules:

- `options` has **exactly three** entries, one each for `reuse`, `refurbish`, `recycle`.
- `estimatedValueInr` is the **net** amount after repair and transport costs.
- `recommendedPathway` must match one of the `options[].pathway` values.
- `confidence` is between 0 and 1. Below 0.6 the frontend shows a caution note.
- `conditionGrade`: `A` (like new) | `B` (light wear) | `C` (needs repair) | `D` (poor or not working).
- `effort`: `low` | `medium` | `high`. `unit`: `g` | `mg`.
- `reasoning` is 1 to 2 short, plain-language sentences shown to the user as is.

---

## 3. `GET /api/partners?pathway={pathway}&city={city}`: list partners

| Query     | Required | Notes                                       |
| --------- | -------- | ------------------------------------------- |
| `pathway` | yes      | `reuse` \| `refurbish` \| `recycle`         |
| `city`    | no       | Exact city name, e.g. `Bengaluru`. Omit for all cities. |

**200** response:

```json
{
  "partners": [
    {
      "id": "p-rep-blr-1",
      "name": "Example Repair Workshop",
      "type": "repair",
      "pathways": ["refurbish", "reuse"],
      "city": "Bengaluru",
      "area": "SP Road",
      "phone": "+91 80 1234 5678",
      "email": "hello@example.com",
      "offersPickup": true
    }
  ]
}
```

- `type`: `resale` | `repair` | `recycler`.
- Return an empty array (not 404) when nothing matches.
- If `offersPickup` is `false`, the frontend only lets the user choose drop-off.

---

## 4. `POST /api/pickups`: book a pickup or drop-off

`application/json` body:

```json
{
  "submissionId": "sub_8f3k2l1q",
  "partnerId": "p-rep-blr-1",
  "pathway": "refurbish",
  "method": "pickup",
  "name": "Asha Rao",
  "phone": "9876543210",
  "address": "Flat 4B, 12 MG Road, Indiranagar, Bengaluru 560038",
  "preferredDate": "2026-10-23",
  "preferredSlot": "morning"
}
```

- `method`: `pickup` | `dropoff`. `address` is `""` for `dropoff`.
- `phone` is 10 digits, no country code, starting 6 to 9.
- `preferredDate` is tomorrow or later (the UI allows up to 30 days ahead).
- `preferredSlot`: `morning` (9 am to 12 pm) | `afternoon` (12 to 4 pm) | `evening` (4 to 7 pm).

**201** response:

```json
{
  "requestId": "RV-482913",
  "status": "received",
  "partnerId": "p-rep-blr-1",
  "partnerName": "Example Repair Workshop",
  "method": "pickup",
  "preferredDate": "2026-10-23",
  "preferredSlot": "morning",
  "createdAt": "2026-10-21T15:44:02Z"
}
```

---

## Errors (all endpoints)

Any non-2xx response should use this body:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Some details need fixing.",
    "fields": { "phone": "Enter a 10-digit mobile number." }
  }
}
```

- `message` is shown to the user, so write it in plain language.
- `fields` is optional and only for **422** validation errors. Keys match the request
  field names (`phone`, `address`, `preferredDate`, ...). The pickup form shows each
  message next to the matching field.

Suggested codes:

| Status | `code`                 | When                                  |
| ------ | ---------------------- | ------------------------------------- |
| 400    | `bad_request`          | Malformed body or missing photo       |
| 404    | `submission_not_found` | Unknown `submissionId`                |
| 404    | `partner_not_found`    | Unknown or inactive `partnerId`       |
| 413    | `photo_too_large`      | A photo is over 10 MB                 |
| 422    | `validation_failed`    | Field-level problems (use `fields`)   |
| 500    | `analysis_failed`      | Valuation could not complete          |
| 503    | `partners_unavailable` | Partner directory is down             |
