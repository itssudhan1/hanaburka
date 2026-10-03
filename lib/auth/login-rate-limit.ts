import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Deliberately generous-but-real limits: this is meant to stop scripted
// brute-force guessing, not to lock out a real admin who mistyped their
// password twice. Tune these if that balance feels wrong in practice.
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MINUTES = 15;

/**
 * Checks whether this email has too many recent failed login attempts to
 * allow another try right now. DB-backed (not in-memory) because
 * serverless function instances don't share memory between invocations —
 * an in-memory counter would reset on practically every request and
 * provide no real protection.
 */
export async function isLoginRateLimited(
  email: string
): Promise<{ limited: boolean; retryAfterMinutes?: number }> {
  const supabase = createAdminClient();
  const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000).toISOString();

  const { data: attempts } = await supabase
    .from("admin_login_attempts")
    .select("created_at, success")
    .eq("email", email.toLowerCase().trim())
    .gte("created_at", windowStart)
    .order("created_at", { ascending: false });

  if (!attempts || attempts.length === 0) return { limited: false };

  // A successful sign-in clears the slate — only count failures since the
  // most recent success (or since the start of the window if none).
  const mostRecentSuccessIndex = attempts.findIndex((a) => a.success);
  const relevant = mostRecentSuccessIndex === -1 ? attempts : attempts.slice(0, mostRecentSuccessIndex);
  const failedCount = relevant.filter((a) => !a.success).length;

  if (failedCount < MAX_FAILED_ATTEMPTS) return { limited: false };

  const oldestRelevantFailure = relevant[relevant.length - 1];
  const unlocksAt = new Date(oldestRelevantFailure.created_at).getTime() + LOCKOUT_WINDOW_MINUTES * 60 * 1000;
  const retryAfterMinutes = Math.max(1, Math.ceil((unlocksAt - Date.now()) / 60000));
  return { limited: true, retryAfterMinutes };
}

export async function recordLoginAttempt(email: string, success: boolean) {
  const supabase = createAdminClient();
  await supabase.from("admin_login_attempts").insert({
    email: email.toLowerCase().trim(),
    success,
  });
}
