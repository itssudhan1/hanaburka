"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/admin-orders";

const STATUSES = [
  "pending", "confirmed", "processing", "packed", "shipped",
  "out_for_delivery", "delivered", "cancelled",
  "return_requested", "returned", "refunded",
] as const;

export default function StatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border border-mocha/30 px-3 py-2 text-sm"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <button
        disabled={isPending || status === currentStatus}
        onClick={() =>
          startTransition(async () => {
            await updateOrderStatus(orderId, status as any);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          })
        }
        className="bg-espresso text-ivory px-4 py-2 text-sm disabled:opacity-40"
      >
        {isPending ? "Saving..." : saved ? "Saved" : "Update Status"}
      </button>
    </div>
  );
}
