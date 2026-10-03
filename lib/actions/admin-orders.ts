"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const ORDER_STATUSES = [
  "pending", "confirmed", "processing", "packed", "shipped",
  "out_for_delivery", "delivered", "cancelled",
  "return_requested", "returned", "refunded",
] as const;

export async function updateOrderStatus(
  orderId: string,
  status: (typeof ORDER_STATUSES)[number]
) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN", "STAFF"]);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
  // trg_audit_order_status (migration 0007) logs this change automatically.

  revalidatePath("/account/orders");
  revalidatePath("/admin/orders");
}

const shipmentSchema = z.object({
  carrier: z.string().min(1).max(100),
  trackingNumber: z.string().min(1).max(100),
  trackingUrl: z.string().url().optional(),
});

export async function addShipment(
  orderId: string,
  input: z.infer<typeof shipmentSchema>
) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN", "STAFF"]);
  const parsed = shipmentSchema.parse(input);
  const supabase = createAdminClient();

  const { error: shipmentError } = await supabase.from("shipments").insert({
    order_id: orderId,
    carrier: parsed.carrier,
    tracking_number: parsed.trackingNumber,
    tracking_url: parsed.trackingUrl,
    shipped_at: new Date().toISOString(),
  });
  if (shipmentError) throw new Error(shipmentError.message);

  await supabase.from("orders").update({ status: "shipped" }).eq("id", orderId);

  revalidatePath("/account/orders");
  revalidatePath("/admin/orders");
}

export async function markDelivered(orderId: string) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN", "STAFF"]);
  const supabase = createAdminClient();

  await supabase
    .from("shipments")
    .update({ delivered_at: new Date().toISOString() })
    .eq("order_id", orderId);
  const { error } = await supabase
    .from("orders")
    .update({ status: "delivered" })
    .eq("id", orderId);
  if (error) throw new Error(error.message);

  revalidatePath("/account/orders");
  revalidatePath("/admin/orders");
}

export async function approveReturn(returnId: string, refundAmount: number) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();

  const { data: returnRow, error: returnError } = await supabase
    .from("returns")
    .update({ status: "approved", refund_amount: refundAmount })
    .eq("id", returnId)
    .select("order_id")
    .single();
  if (returnError) throw new Error(returnError.message);

  await supabase
    .from("orders")
    .update({ status: "returned" })
    .eq("id", returnRow.order_id);

  revalidatePath("/account/orders");
  revalidatePath("/admin/returns");
}

export async function markReturnRefunded(returnId: string) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();

  const { data: returnRow, error } = await supabase
    .from("returns")
    .update({ status: "refunded" })
    .eq("id", returnId)
    .select("order_id")
    .single();
  if (error) throw new Error(error.message);

  await supabase
    .from("orders")
    .update({ status: "refunded", payment_status: "refunded" })
    .eq("id", returnRow.order_id);

  revalidatePath("/account/orders");
  revalidatePath("/admin/returns");
}

export async function rejectReturn(returnId: string, reason?: string) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("returns")
    .update({ status: "rejected", reason })
    .eq("id", returnId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/returns");
}
