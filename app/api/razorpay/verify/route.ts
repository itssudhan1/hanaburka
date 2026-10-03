import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Verifies the Razorpay payment signature server-side. This is the ONLY
 * place an order is marked paid — a client-side "payment succeeded" event
 * from Razorpay's modal is never trusted on its own, per your spec's
 * "Do not use fake payment success" rule.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Razorpay is not configured on the server" },
      { status: 500 }
    );
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    // Do not touch the order on a failed verification — leave it 'pending'
    // so a retried/legitimate payment attempt isn't blocked.
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id, order_id")
    .eq("razorpay_order_id", razorpay_order_id)
    .single();

  if (paymentError || !payment) {
    return NextResponse.json({ error: "Order not found for this payment" }, { status: 404 });
  }

  await supabase
    .from("payments")
    .update({
      razorpay_payment_id,
      razorpay_signature,
      status: "paid",
      raw_response: body,
    })
    .eq("id", payment.id);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .update({ payment_status: "paid", status: "confirmed" })
    .eq("id", payment.order_id)
    .select("order_number")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Could not update order" }, { status: 500 });
  }

  return NextResponse.json({ orderNumber: order.order_number });
}
