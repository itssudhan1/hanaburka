"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { createRazorpayOrder } from "@/lib/actions/razorpay";
import type { BaseCheckoutFields } from "@/lib/actions/checkout-schema";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayButton({
  getFields,
  couponCode,
}: {
  getFields: () => BaseCheckoutFields;
  couponCode?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const { razorpayOrderId, amount, keyId, orderNumber } = await createRazorpayOrder(
        getFields(),
        couponCode
      );

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency: "INR",
        name: "HANA BURKA",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const result = await verifyRes.json();

          if (!verifyRes.ok) {
            setError(result.error ?? "Payment verification failed");
            return;
          }
          router.push(`/order-confirmation/${result.orderNumber}`);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        theme: { color: "#241C18" },
      });

      rzp.open();
    } catch (err: any) {
      setError(err.message ?? "Could not start payment");
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {error && <p className="text-rose text-sm mb-3">{error}</p>}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full bg-espresso text-ivory py-3 text-sm tracking-wide hover:bg-charcoal transition-colors disabled:opacity-50"
      >
        {loading ? "OPENING PAYMENT..." : "PAY WITH RAZORPAY"}
      </button>
    </>
  );
}
