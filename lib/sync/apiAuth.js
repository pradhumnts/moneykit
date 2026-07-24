import {
  getPinFromRequest,
  isSyncConfigured,
  verifyPin,
} from "@/lib/sync/pin";

export function requireSyncConfigured() {
  if (!isSyncConfigured()) {
    return Response.json(
      { error: "Cloud sync is not configured on the server." },
      { status: 503 }
    );
  }
  return null;
}

export function requirePin(request) {
  const configured = requireSyncConfigured();
  if (configured) return { errorResponse: configured };

  const pin = getPinFromRequest(request);
  if (!verifyPin(pin)) {
    return {
      errorResponse: Response.json({ error: "Incorrect PIN." }, { status: 401 }),
    };
  }
  return { pin };
}

export async function readJson(request) {
  try {
    return { body: await request.json() };
  } catch {
    return {
      errorResponse: Response.json({ error: "Invalid request body." }, { status: 400 }),
    };
  }
}
