import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase instance. Uses the publishable (anon) key only.
 * Every table this client can touch MUST have an RLS policy —
 * see supabase/migrations/0002_rls_policies.sql.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
