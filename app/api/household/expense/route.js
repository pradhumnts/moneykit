import { createExpenseInDb } from "@/lib/supabase/householdDb";
import { readJson, requirePin } from "@/lib/sync/apiAuth";

export async function POST(request) {
  const auth = requirePin(request);
  if (auth.errorResponse) return auth.errorResponse;

  const parsed = await readJson(request);
  if (parsed.errorResponse) return parsed.errorResponse;

  try {
    const state = await createExpenseInDb(parsed.body || {});
    return Response.json({ state });
  } catch (error) {
    const status = error?.validation ? 400 : 500;
    return Response.json(
      {
        error: error?.message || "Could not save expense.",
        validation: error?.validation || null,
      },
      { status }
    );
  }
}
