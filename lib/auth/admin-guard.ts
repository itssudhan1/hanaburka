import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "STAFF";

export class UnauthorizedError extends Error {
  status = 401;
}
export class ForbiddenError extends Error {
  status = 403;
}

/**
 * Call this at the top of EVERY admin route handler / server action,
 * before touching the admin (service_role) client. Never trust a role
 * claimed by the client — this re-checks admin_users on every call.
 *
 * Usage:
 *   const admin = await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
 */
export async function requireAdmin(allowedRoles?: AdminRole[]) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError("Not signed in");
  }

  const { data: adminRow, error } = await supabase
    .from("admin_users")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();

  if (error || !adminRow || !adminRow.is_active) {
    throw new ForbiddenError("Not an active admin");
  }

  if (allowedRoles && !allowedRoles.includes(adminRow.role as AdminRole)) {
    throw new ForbiddenError(`Requires role: ${allowedRoles.join(" or ")}`);
  }

  return { userId: user.id, role: adminRow.role as AdminRole };
}
