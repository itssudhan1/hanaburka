"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkoutSchemaBase } from "@/lib/actions/checkout-schema";

const checkoutSchema = checkoutSchemaBase.extend({
  paymentMethod: z.literal("whatsapp"),
  couponCode: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/**
 * Creates a confirmed order (WhatsApp or COD path) via the atomic
 * `create_order_from_cart` Postgres function — see migration 0009.
 * That function is the single source of truth for pricing and stock;
 * this action never computes or passes a price/total itself.
 */
export async function placeOrder(input: CheckoutInput) {
  const parsed = checkoutSchema.parse(input);
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
    p_payment_method: parsed.paymentMethod,
    p_order_note: parsed.orderNote || null,
    p_coupon_code: parsed.couponCode || null,
  });

  if (error) throw new Error(error.message);
  const result = Array.isArray(data) ? data[0] : data;
  return result as { order_id: string; order_number: string; total: number; discount: number };
}

export async function getCheckoutMode(): Promise<"whatsapp" | "razorpay"> {
  const supabase = createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "checkout_mode")
    .single();
  return (data?.value as { mode?: "whatsapp" | "razorpay" })?.mode ?? "whatsapp";
}
