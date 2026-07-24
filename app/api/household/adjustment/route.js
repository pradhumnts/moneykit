import { createAdjustmentInDb } from "@/lib/supabase/householdDb";
import { readJson, requirePin } from "@/lib/sync/apiAuth";

export async function POST(request) {
  const auth = requirePin(request);
  if (auth.errorResponse) return auth.errorResponse;

  const parsed = await readJson(request);
  if (parsed.errorResponse) return parsed.errorResponse;

  try {
    const state = await createAdjustmentInDb(parsed.body || {});
    return Response.json({ state });
  } catch (error) {
    const status = error?.validation ? 400 : 500;
    return Response.json(
      {
        error: error?.message || "Could not save adjustment.",
        validation: error?.validation || null,
      },
      { status }
    );
  }
}
