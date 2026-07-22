import { timingSafeEqual } from "crypto";

import { PIN_HEADER } from "@/lib/sync/constants";

export { PIN_HEADER };

export function isSyncConfigured() {
  return Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.HOUSEHOLD_PIN
  );
}

export function verifyPin(input) {
  const expected = process.env.HOUSEHOLD_PIN;
  if (!expected || input == null) return false;

  const provided = String(input);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export function getPinFromRequest(request) {
  return request.headers.get(PIN_HEADER) || "";
}
