"use client";

import { useState, useTransition } from "react";
import { requestReturn } from "@/lib/actions/returns";

export default function ReturnRequestForm({
  orderId,
  orderItemId,
}: {
  orderId: string;
  orderItemId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return <p className="text-sm text-mocha">Return requested — we&apos;ll review it shortly.</p>;
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm underline text-charcoal/70">
        Request Return
      </button>
    );
  }

  return (
    <div className="space-y-2 max-w-sm">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for return"
        className="w-full border border-mocha/30 bg-transparent px-3 py-2 text-sm"
        rows={2}
      />
      {error && <p className="text-rose text-sm">{error}</p>}
      <div className="flex gap-3">
        <button
          disabled={isPending || !reason.trim()}
          onClick={() =>
            startTransition(async () => {
              try {
                await requestReturn(orderId, orderItemId, reason);
                setDone(true);
              } catch (err: any) {
                setError(err.message ?? "Could not submit return request");
              }
            })
          }
          className="bg-espresso text-ivory px-4 py-2 text-sm disabled:opacity-50"
        >
          Submit
        </button>
        <button onClick={() => setOpen(false)} className="text-sm text-charcoal/60">
          Cancel
        </button>
      </div>
    </div>
  );
}
