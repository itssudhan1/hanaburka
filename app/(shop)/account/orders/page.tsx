import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";
import Footer from "@/components/Footer";
import OrderStatusTimeline from "@/components/account/OrderStatusTimeline";
import { createClient } from "@/lib/supabase/server";

export default async function OrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <Navbar />
        <AuthCard title="Your Orders" subtitle="Sign in to track your orders and view past purchases.">
          <LoginForm redirectTo="/account/orders" />
        </AuthCard>
        <Footer />
      </>
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl mb-8">Your Orders</h1>

        {!orders || orders.length === 0 ? (
          <div className="py-16 text-center text-charcoal/60">
            <p className="mb-6">You haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="inline-block bg-espresso text-ivory px-8 py-3 text-sm tracking-wide">
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.order_number}`}
                className="block border border-mocha/15 p-5 hover:border-mocha/40 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-espresso">{order.order_number}</p>
                    <p className="text-xs text-charcoal/50">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-espresso">
                    ₹{order.total.toLocaleString("en-IN")}
                  </p>
                </div>
                <OrderStatusTimeline status={order.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
