"use client";

import { useState, useTransition } from "react";
import { setCheckoutMode, setWhatsappNumber, setBusinessInfo, setShowBuyNow } from "@/lib/actions/admin-settings";

export default function SettingsForm({
  checkoutMode,
  whatsappNumber,
  businessInfo,
  showBuyNow,
}: {
  checkoutMode: "whatsapp" | "razorpay";
  whatsappNumber: string;
  businessInfo: { name: string; address: string; phone: string; phoneSecondary?: string };
  showBuyNow: boolean;
}) {
  const [mode, setMode] = useState(checkoutMode);
  const [whatsapp, setWhatsapp] = useState(whatsappNumber);
  const [buyNowEnabled, setBuyNowEnabled] = useState(showBuyNow);
  const [bizName, setBizName] = useState(businessInfo.name);
  const [bizAddress, setBizAddress] = useState(businessInfo.address);
  const [bizPhone, setBizPhone] = useState(businessInfo.phone);
  const [bizPhone2, setBizPhone2] = useState(businessInfo.phoneSecondary ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <div className="space-y-10 max-w-lg">
      <div>
        <h2 className="text-lg text-espresso mb-3">Checkout Mode</h2>
        <p className="text-sm text-charcoal/60 mb-3">
          Switch site-wide, any time — no redeploy needed.
        </p>
        <div className="flex gap-4 text-sm mb-3">
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === "whatsapp"} onChange={() => setMode("whatsapp")} />
            WhatsApp ordering
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === "razorpay"} onChange={() => setMode("razorpay")} />
            Razorpay (online payment)
          </label>
        </div>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await setCheckoutMode(mode);
              setSaved("mode");
              setTimeout(() => setSaved(null), 2000);
            })
          }
          className="bg-espresso text-ivory px-4 py-2 text-sm disabled:opacity-40"
        >
          {saved === "mode" ? "Saved" : "Save"}
        </button>
        <p className="text-xs text-charcoal/50 mt-3">
          Cash on Delivery has been removed as a payment option site-wide.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-espresso mb-3">WhatsApp Number</h2>
        <p className="text-xs text-charcoal/50 mb-2">
          Country code, no + or spaces (e.g. 919876543210)
        </p>
        <div className="flex gap-2">
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="flex-1 border border-mocha/30 px-3 py-2 text-sm"
          />
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await setWhatsappNumber(whatsapp);
                setSaved("whatsapp");
                setTimeout(() => setSaved(null), 2000);
              })
            }
            className="bg-espresso text-ivory px-4 py-2 text-sm disabled:opacity-40"
          >
            {saved === "whatsapp" ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg text-espresso mb-3">Product Page</h2>
        <label className="flex items-center gap-2 text-sm mb-3">
          <input
            type="checkbox"
            checked={buyNowEnabled}
            onChange={(e) => setBuyNowEnabled(e.target.checked)}
          />
          Show &quot;Buy Now&quot; button on product pages
        </label>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await setShowBuyNow(buyNowEnabled);
              setSaved("buynow");
              setTimeout(() => setSaved(null), 2000);
            })
          }
          className="bg-espresso text-ivory px-4 py-2 text-sm disabled:opacity-40"
        >
          {saved === "buynow" ? "Saved" : "Save"}
        </button>
      </div>

      <div>
        <h2 className="text-lg text-espresso mb-3">Business Info</h2>
        <p className="text-xs text-charcoal/50 mb-3">
          Shown in the footer and Contact page.
        </p>
        <div className="space-y-2 mb-3">
          <input value={bizName} onChange={(e) => setBizName(e.target.value)} placeholder="Business name" className="w-full border border-mocha/30 px-3 py-2 text-sm" />
          <textarea value={bizAddress} onChange={(e) => setBizAddress(e.target.value)} placeholder="Address" className="w-full border border-mocha/30 px-3 py-2 text-sm" rows={2} />
          <div className="flex gap-2">
            <input value={bizPhone} onChange={(e) => setBizPhone(e.target.value)} placeholder="Primary phone" className="flex-1 border border-mocha/30 px-3 py-2 text-sm" />
            <input value={bizPhone2} onChange={(e) => setBizPhone2(e.target.value)} placeholder="Secondary phone (optional)" className="flex-1 border border-mocha/30 px-3 py-2 text-sm" />
          </div>
        </div>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await setBusinessInfo({
                name: bizName,
                address: bizAddress,
                phone: bizPhone,
                phoneSecondary: bizPhone2 || undefined,
              });
              setSaved("business");
              setTimeout(() => setSaved(null), 2000);
            })
          }
          className="bg-espresso text-ivory px-4 py-2 text-sm disabled:opacity-40"
        >
          {saved === "business" ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
