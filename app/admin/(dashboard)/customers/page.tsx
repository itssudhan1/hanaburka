import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminCustomersPage() {
  const supabase = createAdminClient();

  // Page through ALL Supabase Auth users (listUsers caps at 1000/page,
  // itself a hard ceiling on the Admin API) rather than just the first 50.
  let allUsers: any[] = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data?.users?.length) break;
    allUsers = allUsers.concat(data.users);
    if (data.users.length < 1000) break;
    page += 1;
  }

  const [{ data: profiles }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, phone, created_at"),
    supabase.from("orders").select("user_id, total, payment_status"),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const orderStats = new Map<string, { count: number; spent: number }>();
  for (const o of orders ?? []) {
    if (!o.user_id) continue;
    const existing = orderStats.get(o.user_id) ?? { count: 0, spent: 0 };
    existing.count += 1;
    if (o.payment_status === "paid" || o.payment_status === "pending") {
      existing.spent += o.total;
    }
    orderStats.set(o.user_id, existing);
  }

  const customers = allUsers
    .map((u) => {
      const profile = profileMap.get(u.id);
      const stats = orderStats.get(u.id) ?? { count: 0, spent: 0 };
      return {
        id: u.id,
        email: u.email,
        full_name: profile?.full_name ?? "—",
        phone: profile?.phone ?? "—",
        created_at: u.created_at,
        orderCount: stats.count,
        totalSpent: stats.spent,
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-espresso">Customers</h1>
        <span className="text-sm text-charcoal/50">{customers.length} total</span>
      </div>
      <div className="border border-mocha/15 bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-charcoal/50 border-b border-mocha/15">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Total Spent</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-mocha/10 hover:bg-ivory">
                <td className="p-3">
                  <Link href={`/admin/customers/${c.id}`} className="text-espresso underline">
                    {c.full_name}
                  </Link>
                </td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.orderCount}</td>
                <td className="p-3">₹{c.totalSpent.toLocaleString("en-IN")}</td>
                <td className="p-3 text-charcoal/50">
                  {new Date(c.created_at).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={6} className="p-5 text-charcoal/50">No customers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
