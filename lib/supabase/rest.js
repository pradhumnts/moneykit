function getConfig() {
  const rawUrl = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!rawUrl || !key) {
    throw new Error("Cloud sync is not configured.");
  }

  let url = rawUrl.replace(/\/$/, "");
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url.replace(/\.supabase\.co$/i, "")}.supabase.co`;
  }

  return { url, key };
}

export function supabaseHeaders(extra = {}) {
  const { key } = getConfig();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: "application/json",
    ...extra,
  };
}

export function supabaseUrl(path) {
  const { url } = getConfig();
  return `${url}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function supabaseRest(path, { method = "GET", body, headers } = {}) {
  const response = await fetch(supabaseUrl(path), {
    method,
    headers: supabaseHeaders({
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    }),
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      (typeof data === "object" && (data?.message || data?.error)) ||
      (typeof data === "string" ? data : null) ||
      `Supabase request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function supabaseRpc(fnName, args) {
  return supabaseRest(`/rest/v1/rpc/${fnName}`, {
    method: "POST",
    body: args,
  });
}
