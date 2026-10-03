"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveReview, rejectReview } from "@/lib/actions/review-moderation";

export default function ReviewModerationList({ reviews }: { reviews: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (reviews.length === 0) {
    return <p className="text-charcoal/50">No pending reviews.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="border border-mocha/15 p-4 bg-white">
          <p className="text-sm text-charcoal/50 mb-1">{r.product?.name}</p>
          <p className="mb-1">{"★".repeat(r.rating)}</p>
          {r.title && <p className="text-espresso mb-1">{r.title}</p>}
          {r.body && <p className="text-sm text-charcoal/70 mb-3">{r.body}</p>}
          <div className="flex gap-3">
            <button
              disabled={isPending}
              onClick={() => startTransition(async () => { await approveReview(r.id); router.refresh(); })}
              className="bg-espresso text-ivory px-3 py-1 text-sm disabled:opacity-40"
            >
              Approve
            </button>
            <button
              disabled={isPending}
              onClick={() => startTransition(async () => { await rejectReview(r.id); router.refresh(); })}
              className="text-rose underline"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
