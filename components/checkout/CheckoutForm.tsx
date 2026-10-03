"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { placeOrder, type CheckoutInput } from "@/lib/actions/checkout";
import RazorpayButton from "@/components/checkout/RazorpayButton";
import type { BaseCheckoutFields } from "@/lib/actions/checkout-schema";

export default function CheckoutForm({
  mode,
  whatsappNumber,
}: {
  mode: "whatsapp" | "razorpay";
  whatsappNumber: string | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "razorpay">(mode);
  const [couponCode, setCouponCode] = useState("");

  function readBaseFields(): BaseCheckoutFields {
    const form = formRef.current!;
    const data = new FormData(form);
    return {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      line1: String(data.get("line1") ?? ""),
      area: String(data.get("area") ?? ""),
      city: String(data.get("city") ?? ""),
      state: String(data.get("state") ?? ""),
      pincode: String(data.get("pincode") ?? ""),
      country: "India",
      deliveryInstructions: String(data.get("deliveryInstructions") ?? ""),
      orderNote: String(data.get("orderNote") ?? ""),
    };
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (paymentMethod === "razorpay") return; // handled by RazorpayButton instead
    setError(null);

    const base = readBaseFields();
    const input: CheckoutInput = { ...base, paymentMethod: "whatsapp", couponCode: couponCode || undefined };

    startTransition(async () => {
      try {
        const result = await placeOrder(input);

        if (whatsappNumber) {
          const message =
            `New order ${result.order_number}\n\n` +
            `Name: ${input.name}\n` +
            `Phone: ${input.phone}\n` +
            `Address: ${input.line1}, ${input.area ?? ""}, ${input.city}, ${input.state} ${input.pincode}\n` +
            (input.orderNote ? `Note: ${input.orderNote}\n` : "") +
            `\nTotal: ₹${result.total.toLocaleString("en-IN")}\n` +
            `(Full item list is in your admin dashboard under this order number.)`;

          window.open(
            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
            "_blank"
          );
        }

        router.push(`/order-confirmation/${result.order_number}`);
      } catch (err: any) {
        setError(err.message ?? "Could not place order");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-xl mb-4">Contact & Delivery</h2>
        <div className="space-y-3">
          <input name="name" required aria-label="Full name" placeholder="Full name" className="w-full border border-mocha/30 bg-transparent px-4 py-3 text-sm" />
          <input name="phone" required aria-label="Phone number" placeholder="Phone" className="w-full border border-mocha/30 bg-transparent px-4 py-3 text-sm" />
          <input name="email" type="email" aria-label="Email (optional)" placeholder="Email (optional)" className="w-full border border-mocha/30 bg-transparent px-4 py-3 text-sm" />
          <input name="line1" required aria-label="Address" placeholder="Address" className="w-full border border-mocha/30 bg-transparent px-4 py-3 text-sm" />
          <input name="area" aria-label="Area or landmark" placeholder="Area / Landmark" className="w-full border border-mocha/30 bg-transparent px-4 py-3 text-sm" />
          <div className="flex gap-3">
            <input name="city" required aria-label="City" placeholder="City" className="w-1/2 border border-mocha/30 bg-transparent px-4 py-3 text-sm" />
            <input name="state" required aria-label="State" placeholder="State" className="w-1/2 border border-mocha/30 bg-transparent px-4 py-3 text-sm" />
          </div>
          <input name="pincode" required aria-label="Pincode" placeholder="Pincode" className="w-full border border-mocha/30 bg-transparent px-4 py-3 text-sm" />
          <textarea name="deliveryInstructions" aria-label="Delivery instructions (optional)" placeholder="Delivery instructions (optional)" className="w-full border border-mocha/30 bg-transparent px-4 py-3 text-sm" rows={2} />
        </div>
      </div>

      <div>
        <h2 className="text-xl mb-4">Coupon</h2>
        <input
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Coupon code (optional)"
          className="w-full border border-mocha/30 bg-transparent px-4 py-3 text-sm"
        />
      </div>

      <div>
        <h2 className="text-xl mb-4">Payment</h2>
        <div className="space-y-2 text-sm">
          {mode === "whatsapp" && (
            <label className="flex items-center gap-2">
              <input type="radio" checked readOnly />
              Order via WhatsApp — we&apos;ll confirm price &amp; delivery with you directly
            </label>
          )}
          {mode === "razorpay" && (
            <label className="flex items-center gap-2">
              <input type="radio" checked readOnly />
              Pay online (Razorpay)
            </label>
          )}
        </div>
      </div>

      <textarea
        name="orderNote"
        placeholder="Order note (optional)"
        className="w-full border border-mocha/30 bg-transparent px-4 py-3 text-sm"
        rows={2}
      />

      {error && <p className="text-rose text-sm">{error}</p>}

      {paymentMethod === "razorpay" ? (
        <RazorpayButton getFields={readBaseFields} couponCode={couponCode} />
      ) : (
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-espresso text-ivory py-3 text-sm tracking-wide hover:bg-charcoal transition-colors disabled:opacity-50"
        >
          {isPending ? "PLACING ORDER..." : "PLACE ORDER & CONTINUE ON WHATSAPP"}
        </button>
      )}
    </form>
  );
}
