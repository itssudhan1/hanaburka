import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusTimeline from "@/components/account/OrderStatusTimeline";
import ReturnRequestForm from "@/components/account/ReturnRequestForm";
import { createClient } from "@/lib/supabase/server";

export default async function OrderDetailPage({
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
    .select("*, order_items(*), shipments(*), returns(*)")
    .eq("order_number", params.orderNumber)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const shipment = order.shipments?.[0];
  const returnedItemIds = new Set(
    (order.returns ?? []).map((r: any) => r.order_item_id)
  );

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl">{order.order_number}</h1>
          <span className="text-sm text-charcoal/50">
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </span>
        </div>

        <div className="mb-8">
          <OrderStatusTimeline status={order.status} />
        </div>

        {shipment?.tracking_number && (
          <div className="border border-mocha/15 p-4 mb-8 text-sm">
            <p className="text-espresso mb-1">Shipment</p>
            <p>{shipment.carrier} — {shipment.tracking_number}</p>
            {shipment.tracking_url && (
              <a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer" className="underline text-rose">
                Track package
              </a>
            )}
          </div>
        )}

        <div className="space-y-4 mb-8">
          {order.order_items.map((item: any) => (
            <div key={item.id} className="flex justify-between items-start border-b border-mocha/10 pb-4">
              <div>
                <p className="text-espresso">{item.product_name}</p>
                <p className="text-sm text-charcoal/60">
                  {item.colour} / {item.size} × {item.quantity}
                </p>
                {order.status === "delivered" && !returnedItemIds.has(item.id) && (
                  <div className="mt-2">
                    <ReturnRequestForm orderId={order.id} orderItemId={item.id} />
                  </div>
                )}
              </div>
              <p className="text-sm text-espresso">
                ₹{item.line_total.toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>

        <div className="text-sm space-y-1 border-t border-mocha/15 pt-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shipping_fee === 0 ? "Free" : `₹${order.shipping_fee}`}</span>
          </div>
          <div className="flex justify-between text-espresso font-medium pt-2">
            <span>Total</span>
            <span>₹{order.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
