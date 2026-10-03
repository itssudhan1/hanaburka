import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminClient();

  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(params.id);
  if (authError || !authUser?.user) notFound();

  const [{ data: profile }, { data: addresses }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", params.id).single(),
    supabase.from("addresses").select("*").eq("user_id", params.id),
    supabase
      .from("orders")
      .select("order_number, status, total, payment_status, created_at")
      .eq("user_id", params.id)
      .order("created_at", { ascending: false }),
  ]);

  const totalSpent = (orders ?? []).reduce((s, o) => s + o.total, 0);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl text-espresso mb-1">{profile?.full_name || "Customer"}</h1>
      <p className="text-sm text-charcoal/50 mb-8">
        {authUser.user.email} · {profile?.phone ?? "No phone on file"} · Joined{" "}
        {new Date(authUser.user.created_at).toLocaleDateString("en-IN")}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="border border-mocha/15 p-4 bg-white">
          <p className="text-xs text-charcoal/50">Total Orders</p>
          <p className="text-xl text-espresso">{orders?.length ?? 0}</p>
        </div>
        <div className="border border-mocha/15 p-4 bg-white">
          <p className="text-xs text-charcoal/50">Total Spent</p>
          <p className="text-xl text-espresso">₹{totalSpent.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <h2 className="text-lg text-espresso mb-3">Addresses</h2>
      {addresses && addresses.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4 mb-10 text-sm">
          {addresses.map((a) => (
            <div key={a.id} className="border border-mocha/15 p-4 bg-white">
              <p>{a.full_name} — {a.phone}</p>
              <p>{a.line1}{a.area ? `, ${a.area}` : ""}</p>
              <p>{a.city}, {a.state} {a.pincode}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-charcoal/50 mb-10">No saved addresses.</p>
      )}

      <h2 className="text-lg text-espresso mb-3">Order History</h2>
      <div className="border border-mocha/15 bg-white">
        {(orders ?? []).length === 0 ? (
          <p className="p-4 text-sm text-charcoal/50">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-charcoal/50 border-b border-mocha/15">
                <th className="p-3">Order</th>
                <th className="p-3">Status</th>
                <th className="p-3">Total</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders!.map((o) => (
                <tr key={o.order_number} className="border-b border-mocha/10">
                  <td className="p-3">
                    <Link href={`/admin/orders/${o.order_number}`} className="text-espresso underline">
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="p-3 capitalize">{o.status.replace(/_/g, " ")}</td>
                  <td className="p-3">₹{o.total.toLocaleString("en-IN")}</td>
                  <td className="p-3 text-charcoal/50">
                    {new Date(o.created_at).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
