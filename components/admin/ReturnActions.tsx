"use client";

import { useState, useTransition } from "react";
import { approveReturn, rejectReturn, markReturnRefunded } from "@/lib/actions/admin-orders";

type Return = {
  id: string;
  reason: string | null;
  status: string;
  refund_amount: number | null;
};

export default function ReturnActions({ returns }: { returns: Return[] }) {
  const [isPending, startTransition] = useTransition();
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4">
      {returns.map((r) => (
        <div key={r.id} className="border border-mocha/15 p-4 text-sm">
          <p className="mb-1">Reason: {r.reason ?? "—"}</p>
          <p className="mb-2 capitalize">Status: {r.status}</p>

          {r.status === "requested" && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Refund amount"
                value={amounts[r.id] ?? ""}
                onChange={(e) => setAmounts({ ...amounts, [r.id]: e.target.value })}
                className="border border-mocha/30 px-2 py-1 w-32 text-sm"
              />
              <button
                disabled={isPending || !amounts[r.id]}
                onClick={() =>
                  startTransition(() => approveReturn(r.id, Number(amounts[r.id])))
                }
                className="bg-espresso text-ivory px-3 py-1 text-sm disabled:opacity-40"
              >
                Approve
              </button>
              <button
                disabled={isPending}
                onClick={() => startTransition(() => rejectReturn(r.id))}
                className="text-rose underline"
              >
                Reject
              </button>
            </div>
          )}

          {r.status === "approved" && (
            <button
              disabled={isPending}
              onClick={() => startTransition(() => markReturnRefunded(r.id))}
              className="bg-espresso text-ivory px-3 py-1 text-sm disabled:opacity-40"
            >
              Mark Refunded (₹{r.refund_amount})
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
