import { createAllocationInDb } from "@/lib/supabase/householdDb";
import { readJson, requirePin } from "@/lib/sync/apiAuth";

export async function POST(request) {
  const auth = requirePin(request);
  if (auth.errorResponse) return auth.errorResponse;

  const parsed = await readJson(request);
  if (parsed.errorResponse) return parsed.errorResponse;

  try {
    const state = await createAllocationInDb(parsed.body || {});
    return Response.json({ state });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Could not save allocation." },
      { status: 500 }
    );
  }
}
