import { createAdminClient } from "@/lib/supabase/admin";

// The actual logging already happens at the database level — triggers in
// migration 0007 write here on every product create/edit/delete, price
// change, stock change, and order status change, using auth.uid() so it
// captures who did it regardless of which code path (admin panel, a
// future bulk-import tool, a direct DB fix) made the change. This page is
// just the missing read side: the data has been collected all along with
// nothing to look at it until now.
const ACTION_LABELS: Record<string, string> = {
  product_created: "Product created",
  product_edited: "Product edited",
  product_deleted: "Product deleted",
  price_changed: "Price changed",
  stock_changed: "Stock changed",
  order_status_changed: "Order status changed",
  login_succeeded: "Signed in",
  login_failed: "Failed sign-in attempt",
  login_blocked_inactive: "Blocked sign-in (inactive account)",
};

export default async function AuditLogPage() {
  const supabase = createAdminClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, admin_id, action, entity, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  // audit_logs.admin_id references auth.users, not admin_users directly,
  // so there's no FK PostgREST can embed in one query — fetch names
  // separately and map them in.
  const adminIds = [...new Set((logs ?? []).map((l) => l.admin_id).filter(Boolean))];
  const { data: admins } = adminIds.length
    ? await supabase.from("admin_users").select("id, full_name").in("id", adminIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const adminNames = new Map((admins ?? []).map((a) => [a.id, a.full_name]));

  return (
    <div>
      <h1 className="text-2xl text-espresso mb-2">Audit Log</h1>
      <p className="text-sm text-charcoal/50 mb-6">
        Automatic record of product, price, stock, and order status changes — most recent first.
      </p>
      <div className="border border-mocha/15 bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-charcoal/50 border-b border-mocha/15">
              <th className="p-3">When</th>
              <th className="p-3">Admin</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((log) => (
              <tr key={log.id} className="border-b border-mocha/10 hover:bg-ivory align-top">
                <td className="p-3 text-charcoal/60 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="p-3">
                  {log.admin_id ? adminNames.get(log.admin_id) ?? "Unknown" : "System"}
                </td>
                <td className="p-3">{ACTION_LABELS[log.action] ?? log.action}</td>
                <td className="p-3 text-charcoal/60">
                  {log.entity}
                  {log.entity_id ? ` · ${log.entity_id.slice(0, 8)}` : ""}
                </td>
                <td className="p-3 text-charcoal/60 text-xs max-w-xs truncate">
                  {log.metadata && Object.keys(log.metadata).length > 0
                    ? Object.entries(log.metadata)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")
                    : "—"}
                </td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={5} className="p-5 text-charcoal/50">No activity recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
