# MoneyKit cloud DB setup

## 1. Run SQL in Supabase
Open **SQL Editor** and run the full contents of:

`supabase/schema-v2.sql`

This creates real tables (`accounts`, `transactions`, `allocations`, …) plus atomic functions so two phones can add expenses without overwriting each other.

You can keep the old `household_sync` table. On first load the app will migrate blob data into the new tables if the DB is empty.

## 2. Vercel env vars
| Name | Value |
|------|--------|
| `HOUSEHOLD_PIN` | your shared PIN |
| `SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role **or** new `sb_secret_...` key |

## 3. Deploy
Push/redeploy on Vercel, then on each phone:
1. Open the app and unlock with PIN
2. **Settings → Sync now**
3. Add an expense on one phone → Sync now / reopen on the other — both expenses should exist
