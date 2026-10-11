"use server";

import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  checkoutSchemaBase,
  describeCheckoutIssue,
  type BaseCheckoutFields,
} from "@/lib/actions/checkout-schema";
import type { ActionResult } from "@/lib/actions/result";

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
): Promise<
  ActionResult<{
    orderNumber: string;
    razorpayOrderId: string;
    amount: number | string;
    keyId: string;
  }>
> {
  // Expected failures are RETURNED, not thrown — a thrown error's message
  // is replaced with a generic one in production. See lib/actions/result.ts.
  const validation = checkoutSchemaBase.safeParse(input);
  if (!validation.success) {
    return { ok: false, code: "FAILED", message: describeCheckoutIssue(validation.error) };
  }
  const parsed = validation.data;

  // Checked BEFORE creating the order: the order-creation step below
  // reserves stock, so discovering missing keys afterwards would leave
  // stock held against an order that can never be paid.
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    console.error("Razorpay keys are missing from the environment");
    return {
      ok: false,
      code: "FAILED",
      message: "Online payment isn't available right now. Please order via WhatsApp instead.",
    };
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, code: "NOT_SIGNED_IN", message: "Sign in to place an order" };
  }

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
  if (error) {
    console.error("create_order_from_cart failed:", error.message);
    return { ok: false, code: "FAILED", message: error.message };
  }

  const result = Array.isArray(data) ? data[0] : data;
  const { order_id, order_number, total } = result as {
    order_id: string;
    order_number: string;
    total: number;
  };

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

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
      ok: true,
      orderNumber: order_number,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      keyId,
    };
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return {
      ok: false,
      code: "FAILED",
      message: "Could not start the payment. Please try again, or order via WhatsApp.",
    };
  }
}
