"use server";

import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkoutSchemaBase, type BaseCheckoutFields } from "@/lib/actions/checkout-schema";

/**
 * Creates our internal order (via the same atomic create_order_from_cart
 * function used by WhatsApp/COD — so stock is reserved and the total is
 * server-computed exactly the same way), then opens a matching Razorpay
 * order for that exact amount. The client never sets the amount.
 *
 * NOTE: this reserves stock at order-creation time, before payment is
 * confirmed. If a customer abandons the Razorpay modal, that stock stays
 * reserved against a 'pending' order — there's no expiry/cleanup job yet.
 * Flagging this honestly: a scheduled job to release stock from stale
 * unpaid Razorpay orders is a real gap, not built in this phase.
 */
export async function createRazorpayOrder(
  input: BaseCheckoutFields,
  couponCode?: string
) {
  const parsed = checkoutSchemaBase.parse(input);
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to place an order");

  const shippingAddress = {
    full_name: parsed.name,
    phone: parsed.phone,
    line1: parsed.line1,
    area: parsed.area,
    city: parsed.city,
    state: parsed.state,
    pincode: parsed.pincode,
    country: parsed.country,
    delivery_instructions: parsed.deliveryInstructions,
  };

  const { data, error } = await supabase.rpc("create_order_from_cart", {
    p_customer_name: parsed.name,
    p_customer_phone: parsed.phone,
    p_customer_email: parsed.email || null,
    p_shipping_address: shippingAddress,
    p_payment_method: "razorpay",
    p_order_note: parsed.orderNote || null,
    p_coupon_code: couponCode || null,
  });
  if (error) throw new Error(error.message);

  const result = Array.isArray(data) ? data[0] : data;
  const { order_id, order_number, total } = result as {
    order_id: string;
    order_number: string;
    total: number;
  };

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay is not configured yet — RAZORPAY_KEY_ID/SECRET are missing from the environment."
    );
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(total * 100), // paise, computed server-side only
    currency: "INR",
    receipt: order_number,
    notes: { internal_order_id: order_id },
  });

  const admin = createAdminClient();
  await admin.from("payments").insert({
    order_id,
    razorpay_order_id: razorpayOrder.id,
    amount: total,
    status: "pending",
  });

  return {
    orderNumber: order_number,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
}
