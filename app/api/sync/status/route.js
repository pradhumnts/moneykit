import { isSyncConfigured } from "@/lib/sync/pin";

export async function GET() {
  return Response.json({
    syncEnabled: isSyncConfigured(),
  });
}
