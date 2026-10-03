import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function OrderConfirmationPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", params.orderNumber)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl mb-2">Thank you, {order.customer_name.split(" ")[0]}!</h1>
        <p className="text-charcoal/70 mb-8">
          Your order <span className="text-espresso">{order.order_number}</span> has been placed.
        </p>

        {order.payment_method === "whatsapp" && (
          <p className="text-sm text-charcoal/70 mb-8 border border-mocha/15 p-4">
            If your WhatsApp chat didn&apos;t open automatically, message us your
            order number <strong>{order.order_number}</strong> to confirm.
          </p>
        )}
        {order.payment_method === "cod" && (
          <p className="text-sm text-charcoal/70 mb-8 border border-mocha/15 p-4">
            Pay ₹{order.total.toLocaleString("en-IN")} in cash when your order arrives.
          </p>
        )}

        <div className="space-y-3 text-sm mb-6">
          {order.order_items.map((item: any) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.product_name} ({item.colour}/{item.size}) × {item.quantity}
              </span>
              <span>₹{item.line_total.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-mocha/15 pt-4 text-sm space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shipping_fee === 0 ? "Free" : `₹${order.shipping_fee}`}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-mocha">
              <span>Discount</span>
              <span>−₹{order.discount.toLocaleString("en-IN")}</span>
            </div>
          )}
          {order.cod_fee > 0 && (
            <div className="flex justify-between">
              <span>COD Fee</span>
              <span>₹{order.cod_fee}</span>
            </div>
          )}
          <div className="flex justify-between text-espresso font-medium pt-2">
            <span>Total</span>
            <span>₹{order.total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <Link
          href="/shop"
          className="inline-block mt-10 bg-espresso text-ivory px-8 py-3 text-sm tracking-wide hover:bg-charcoal transition-colors"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
      <Footer />
    </>
  );
}
