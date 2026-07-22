import { isSyncConfigured, verifyPin } from "@/lib/sync/pin";

const attempts = new Map();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

function getClientKey(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function isRateLimited(key) {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const pin = String(body?.pin || "");
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return Response.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  if (!verifyPin(pin)) {
    recordFailedAttempt(clientKey);
    return Response.json({ ok: false, error: "Incorrect PIN." }, { status: 401 });
  }

  attempts.delete(clientKey);

  return Response.json({
    ok: true,
    syncEnabled: isSyncConfigured(),
  });
}
