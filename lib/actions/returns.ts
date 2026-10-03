"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function requestReturn(
  orderId: string,
  orderItemId: string,
  reason: string
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to request a return");

  // Only the order's owner can request a return on it, and only once
  // it's actually been delivered — enforced here in addition to the
  // ownership check RLS already does on the insert.
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, user_id")
    .eq("id", orderId)
    .single();

  if (!order || order.user_id !== user.id) {
    throw new Error("Order not found");
  }
  if (order.status !== "delivered") {
    throw new Error("Returns can only be requested for delivered orders");
  }

  const { error } = await supabase.from("returns").insert({
    order_id: orderId,
    order_item_id: orderItemId,
    reason,
    status: "requested",
  });
  if (error) throw new Error(error.message);

  await supabase
    .from("orders")
    .update({ status: "return_requested" })
    .eq("id", orderId);

  revalidatePath("/account/orders");
}
