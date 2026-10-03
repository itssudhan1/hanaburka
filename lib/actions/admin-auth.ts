"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isLoginRateLimited, recordLoginAttempt } from "@/lib/auth/login-rate-limit";

// admin_login_attempts (above) is what the rate limiter actually reads —
// it needs every attempt including ones with no valid admin_id (bad
// email/password), which is why it's a separate table rather than
// audit_logs itself (audit_logs.admin_id is a real FK reference, so it
// can't record "someone tried this email and it doesn't exist"). This
// second write is purely so failed/successful logins show up alongside
// product and order activity on the one Admin → Audit Log page, instead
// of being invisible there.
async function logToAuditTrail(adminId: string | null, action: string, email: string) {
  const supabase = createAdminClient();
  await supabase.from("audit_logs").insert({
    admin_id: adminId,
    action,
    entity: "admin_login",
    entity_id: null,
    metadata: { email },
  });
}

/**
 * Verifies a Cloudflare Turnstile token server-side. Returns true (skips
 * the check) if Turnstile isn't configured at all — TURNSTILE_SECRET_KEY
 * is unset by default, so a fresh deploy isn't broken until an admin
 * actually sets up a site: https://dash.cloudflare.com/?to=/:account/turnstile
 * Set both TURNSTILE_SECRET_KEY (server) and
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY (client, in the login form) to turn it on.
 */
async function verifyCaptcha(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Not configured — don't block sign-in over it.
  if (!token) return false; // Configured, but the widget gave nothing.

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    // Network hiccup talking to Cloudflare shouldn't be the reason a real
    // admin can't get in — fail open here, same as "not configured".
    return true;
  }
}

export type AdminSignInResult = { error: string } | { error: null };

export async function adminSignIn(
  email: string,
  password: string,
  captchaToken: string | null
): Promise<AdminSignInResult> {
  const normalizedEmail = email.toLowerCase().trim();

  const rateLimit = await isLoginRateLimited(normalizedEmail);
  if (rateLimit.limited) {
    return {
      error: `Too many failed attempts. Try again in ${rateLimit.retryAfterMinutes} minute${
        rateLimit.retryAfterMinutes === 1 ? "" : "s"
      }.`,
    };
  }

  const captchaOk = await verifyCaptcha(captchaToken);
  if (!captchaOk) {
    return { error: "Captcha verification failed. Please try again." };
  }

  const supabase = createClient();
  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (signInError || !data.user) {
    await recordLoginAttempt(normalizedEmail, false);
    await logToAuditTrail(null, "login_failed", normalizedEmail);
    return { error: "Invalid email or password." };
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id, is_active")
    .eq("id", data.user.id)
    .single();

  if (!adminRow || !adminRow.is_active) {
    await supabase.auth.signOut();
    await recordLoginAttempt(normalizedEmail, false);
    await logToAuditTrail(data.user.id, "login_blocked_inactive", normalizedEmail);
    return { error: "This account does not have admin access." };
  }

  await recordLoginAttempt(normalizedEmail, true);
  await logToAuditTrail(data.user.id, "login_succeeded", normalizedEmail);
  return { error: null };
}
