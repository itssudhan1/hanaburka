"use client";

import { useState, useTransition } from "react";
import { addShipment } from "@/lib/actions/admin-orders";

export default function ShipmentForm({ orderId }: { orderId: string }) {
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) return <p className="text-sm text-mocha">Shipment recorded — status set to Shipped.</p>;

  return (
    <div className="space-y-2 max-w-sm">
      <input
        value={carrier}
        onChange={(e) => setCarrier(e.target.value)}
        placeholder="Carrier (e.g. Delhivery)"
        className="w-full border border-mocha/30 px-3 py-2 text-sm"
      />
      <input
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        placeholder="Tracking number"
        className="w-full border border-mocha/30 px-3 py-2 text-sm"
      />
      <input
        value={trackingUrl}
        onChange={(e) => setTrackingUrl(e.target.value)}
        placeholder="Tracking URL (optional)"
        className="w-full border border-mocha/30 px-3 py-2 text-sm"
      />
      {error && <p className="text-rose text-sm">{error}</p>}
      <button
        disabled={isPending || !carrier || !trackingNumber}
        onClick={() =>
          startTransition(async () => {
            try {
              await addShipment(orderId, {
                carrier,
                trackingNumber,
                trackingUrl: trackingUrl || undefined,
              });
              setDone(true);
            } catch (err: any) {
              setError(err.message ?? "Could not save shipment");
            }
          })
        }
        className="bg-espresso text-ivory px-4 py-2 text-sm disabled:opacity-40"
      >
        {isPending ? "Saving..." : "Mark Shipped"}
      </button>
    </div>
  );
}
