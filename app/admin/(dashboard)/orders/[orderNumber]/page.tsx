import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import StatusUpdater from "@/components/admin/StatusUpdater";
import StatusBadge from "@/components/admin/StatusBadge";
import ShipmentForm from "@/components/admin/ShipmentForm";
import ReturnActions from "@/components/admin/ReturnActions";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*), shipments(*), returns(*)")
    .eq("order_number", params.orderNumber)
    .single();

  if (!order) notFound();

  const address = order.shipping_address as any;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl text-espresso mb-1">{order.order_number}</h1>
      <p className="text-sm text-charcoal/50 mb-6">
        {new Date(order.created_at).toLocaleString("en-IN")}
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-sm text-charcoal/50 mb-2">Customer</h2>
          <p>{order.customer_name}</p>
          <p>{order.customer_phone}</p>
          {order.customer_email && <p>{order.customer_email}</p>}
        </div>
        <div>
          <h2 className="text-sm text-charcoal/50 mb-2">Shipping Address</h2>
          <p>{address?.line1}</p>
          {address?.area && <p>{address.area}</p>}
          <p>{address?.city}, {address?.state} {address?.pincode}</p>
          {address?.delivery_instructions && (
            <p className="text-charcoal/60 italic">{address.delivery_instructions}</p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm text-charcoal/50 mb-2">Status</h2>
        <div className="mb-3"><StatusBadge status={order.status} /></div>
        <StatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="mb-8">
        <h2 className="text-sm text-charcoal/50 mb-2">Shipment</h2>
        {order.shipments?.[0]?.tracking_number ? (
          <p className="text-sm">
            {order.shipments[0].carrier} — {order.shipments[0].tracking_number}
          </p>
        ) : (
          <ShipmentForm orderId={order.id} />
        )}
      </div>

      {order.returns?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm text-charcoal/50 mb-2">Return Requests</h2>
          <ReturnActions returns={order.returns} />
        </div>
      )}

      <h2 className="text-sm text-charcoal/50 mb-2">Items</h2>
      <div className="space-y-2 mb-8">
        {order.order_items.map((item: any) => (
          <div key={item.id} className="flex justify-between text-sm border-b border-mocha/10 pb-2">
            <span>{item.product_name} ({item.colour}/{item.size}) × {item.quantity}</span>
            <span>₹{item.line_total.toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>

      <div className="text-sm space-y-1 max-w-xs">
        <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString("en-IN")}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>₹{order.shipping_fee}</span></div>
        {order.cod_fee > 0 && <div className="flex justify-between"><span>COD Fee</span><span>₹{order.cod_fee}</span></div>}
        <div className="flex justify-between text-espresso pt-2 border-t border-mocha/15"><span>Total</span><span>₹{order.total.toLocaleString("en-IN")}</span></div>
      </div>
    </div>
  );
}
