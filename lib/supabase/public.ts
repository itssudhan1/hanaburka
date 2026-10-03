import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Anon-key client with NO cookie access at all — safe to call from inside
 * unstable_cache() (or any other cached function), since Next.js forbids
 * touching cookies()/headers() inside a cache scope.
 *
 * Only use this for data with a public RLS read policy (`using (true)`),
 * e.g. site_settings. It runs as a fully anonymous request — no session,
 * so it must never be used for anything user-specific or write-related.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
