const HOUSEHOLD_ROW_ID = "default";
const HISTORY_LIMIT = 5;

function getConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Cloud sync is not configured.");
  }
  return { url: url.replace(/\/$/, ""), key };
}

function supabaseHeaders(key, extra = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: "application/json",
    ...extra,
  };
}

export async function fetchHouseholdState() {
  const { url, key } = getConfig();
  const response = await fetch(
    `${url}/rest/v1/household_sync?id=eq.${HOUSEHOLD_ROW_ID}&select=state,updated_at`,
    {
      headers: supabaseHeaders(key),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Could not load cloud data.");
  }

  const rows = await response.json();
  const row = rows[0];
  if (!row) return { state: null, updatedAt: null };

  return {
    state: row.state,
    updatedAt: row.updated_at,
  };
}

export async function saveHouseholdState(state) {
  const { url, key } = getConfig();
  const updatedAt = new Date().toISOString();
  const payload = {
    id: HOUSEHOLD_ROW_ID,
    state,
    updated_at: updatedAt,
  };

  // Upsert so the first save works even if the seed row is missing.
  const response = await fetch(
    `${url}/rest/v1/household_sync?on_conflict=id`,
    {
      method: "POST",
      headers: supabaseHeaders(key, {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      }),
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Could not save cloud data.");
  }

  const rows = await response.json().catch(() => null);
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Cloud save did not persist. Check Supabase table access.");
  }

  await appendHistory(state, updatedAt);
  return rows[0]?.updated_at || updatedAt;
}

async function appendHistory(state, savedAt) {
  const { url, key } = getConfig();

  const insertResponse = await fetch(`${url}/rest/v1/household_sync_history`, {
    method: "POST",
    headers: supabaseHeaders(key, {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    }),
    body: JSON.stringify({
      state,
      saved_at: savedAt,
    }),
  });

  if (!insertResponse.ok) return;

  const historyResponse = await fetch(
    `${url}/rest/v1/household_sync_history?select=id&order=saved_at.desc`,
    {
      headers: supabaseHeaders(key),
      cache: "no-store",
    }
  );

  if (!historyResponse.ok) return;

  const rows = await historyResponse.json();
  const staleIds = rows.slice(HISTORY_LIMIT).map((row) => row.id);
  if (!staleIds.length) return;

  await fetch(
    `${url}/rest/v1/household_sync_history?id=in.(${staleIds.join(",")})`,
    {
      method: "DELETE",
      headers: supabaseHeaders(key, { Prefer: "return=minimal" }),
    }
  );
}
