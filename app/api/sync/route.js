import {
  fetchHouseholdState,
  saveHouseholdState,
} from "@/lib/supabase/householdSync";
import { getPinFromRequest, isSyncConfigured, verifyPin } from "@/lib/sync/pin";
import { migrateState } from "@/lib/storage/migrations";
import { validateRootState } from "@/lib/storage/validators";

function unauthorized() {
  return Response.json({ error: "Incorrect PIN." }, { status: 401 });
}

function notConfigured() {
  return Response.json(
    { error: "Cloud sync is not configured on the server." },
    { status: 503 }
  );
}

export async function GET(request) {
  if (!isSyncConfigured()) return notConfigured();

  const pin = getPinFromRequest(request);
  if (!verifyPin(pin)) return unauthorized();

  try {
    const { state, updatedAt } = await fetchHouseholdState();
    return Response.json({
      state: state && typeof state === "object" ? state : null,
      updatedAt,
    });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Could not load cloud data." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  if (!isSyncConfigured()) return notConfigured();

  const pin = getPinFromRequest(request);
  if (!verifyPin(pin)) return unauthorized();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validateRootState(body?.state);
  if (!validation.valid) {
    return Response.json(
      { error: validation.reason || "Invalid household state." },
      { status: 400 }
    );
  }

  try {
    const { state } = migrateState(body.state);
    const updatedAt = await saveHouseholdState(state);
    return Response.json({ ok: true, updatedAt });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Could not save cloud data." },
      { status: 500 }
    );
  }
}
