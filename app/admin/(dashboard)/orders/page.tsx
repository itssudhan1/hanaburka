import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import StatusBadge from "@/components/admin/StatusBadge";

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("order_number, customer_name, customer_phone, status, payment_status, payment_method, total, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl text-espresso mb-6">Orders</h1>
      <div className="border border-mocha/15 bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-charcoal/50 border-b border-mocha/15">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.order_number} className="border-b border-mocha/10 hover:bg-ivory">
                <td className="p-3">
                  <Link href={`/admin/orders/${o.order_number}`} className="text-espresso underline">
                    {o.order_number}
                  </Link>
                </td>
                <td className="p-3">{o.customer_name}<br /><span className="text-charcoal/50 text-xs">{o.customer_phone}</span></td>
                <td className="p-3 capitalize">{o.payment_method} · {o.payment_status}</td>
                <td className="p-3"><StatusBadge status={o.status} /></td>
                <td className="p-3">₹{o.total.toLocaleString("en-IN")}</td>
                <td className="p-3 text-charcoal/50">
                  {new Date(o.created_at).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={6} className="p-5 text-charcoal/50">No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
