import {
  bootstrapHouseholdFromState,
  ensureHouseholdState,
} from "@/lib/supabase/householdDb";
import { readJson, requirePin } from "@/lib/sync/apiAuth";
import { isStateEmpty } from "@/lib/sync/stateHelpers";
import { validateRootState } from "@/lib/storage/validators";
import { migrateState } from "@/lib/storage/migrations";

export async function GET(request) {
  const auth = requirePin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const state = await ensureHouseholdState();
    return Response.json({ state });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Could not load household." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = requirePin(request);
  if (auth.errorResponse) return auth.errorResponse;

  const parsed = await readJson(request);
  if (parsed.errorResponse) return parsed.errorResponse;

  const validation = validateRootState(parsed.body?.state);
  if (!validation.valid) {
    return Response.json(
      { error: validation.reason || "Invalid household state." },
      { status: 400 }
    );
  }

  try {
    const { state: migrated } = migrateState(parsed.body.state);
    if (isStateEmpty(migrated)) {
      const state = await ensureHouseholdState();
      return Response.json({ state });
    }
    const state = await bootstrapHouseholdFromState(migrated);
    return Response.json({ state });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Could not bootstrap household." },
      { status: 500 }
    );
  }
}
