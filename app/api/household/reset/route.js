import { resetHouseholdInDb } from "@/lib/supabase/householdDb";
import { requirePin } from "@/lib/sync/apiAuth";

export async function POST(request) {
  const auth = requirePin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const state = await resetHouseholdInDb();
    return Response.json({ state });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Could not reset household." },
      { status: 500 }
    );
  }
}
