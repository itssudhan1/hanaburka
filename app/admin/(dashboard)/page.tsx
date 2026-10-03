import { createAdminClient } from "@/lib/supabase/admin";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-mocha/15 p-5 bg-white">
      <p className="text-xs text-charcoal/50 mb-1">{label}</p>
      <p className="text-2xl text-espresso">{value}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  const supabase = createAdminClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalProducts },
    { count: totalCustomers },
    { data: todayOrders },
    { data: allPaidOrders },
    { data: lowStockVariants },
    { count: outOfStockCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total").gte("created_at", todayStart.toISOString()),
    supabase.from("orders").select("total").eq("payment_status", "paid"),
    supabase.from("inventory").select("variant_id, available, low_stock_threshold"),
    supabase.from("inventory").select("id", { count: "exact", head: true }).eq("available", 0),
    supabase
      .from("orders")
      .select("order_number, customer_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const todaySales = (todayOrders ?? []).reduce((s, o) => s + o.total, 0);
  const totalSales = (allPaidOrders ?? []).reduce((s, o) => s + o.total, 0);
  const lowStockCount = (lowStockVariants ?? []).filter(
    (v) => v.available <= v.low_stock_threshold && v.available > 0
  ).length;

  return (
    <div>
      <h1 className="text-2xl text-espresso mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Today's Sales" value={`₹${todaySales.toLocaleString("en-IN")}`} />
        <StatCard label="Total Sales (Paid)" value={`₹${totalSales.toLocaleString("en-IN")}`} />
        <StatCard label="Total Orders" value={totalOrders ?? 0} />
        <StatCard label="Pending Orders" value={pendingOrders ?? 0} />
        <StatCard label="Products" value={totalProducts ?? 0} />
        <StatCard label="Customers" value={totalCustomers ?? 0} />
        <StatCard label="Low Stock" value={lowStockCount} />
        <StatCard label="Out of Stock" value={outOfStockCount ?? 0} />
      </div>

      <h2 className="text-lg text-espresso mb-3">Recent Orders</h2>
      <div className="border border-mocha/15 bg-white">
        {(recentOrders ?? []).length === 0 ? (
          <p className="p-5 text-sm text-charcoal/50">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-charcoal/50 border-b border-mocha/15">
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Status</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders!.map((o) => (
                <tr key={o.order_number} className="border-b border-mocha/10">
                  <td className="p-3">{o.order_number}</td>
                  <td className="p-3">{o.customer_name}</td>
                  <td className="p-3 capitalize">{o.status.replace(/_/g, " ")}</td>
                  <td className="p-3">₹{o.total.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-charcoal/40 mt-8">
        Revenue/orders/top-products charts and customer-growth analytics are
        not built yet — see the progress report for what&apos;s still pending.
      </p>
    </div>
  );
}
