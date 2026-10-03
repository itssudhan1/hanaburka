import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * DANGER: this client uses the service_role secret key and BYPASSES all RLS.
 * - Never import this into any file that ships to the browser
 *   (the `server-only` import above will throw a build error if you try).
 * - Every route that uses this client MUST re-verify the caller is an
 *   authenticated, active admin (see requireAdmin() in lib/auth/admin-guard.ts)
 *   before doing anything with it. RLS will not save you here — you're the DB now.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
