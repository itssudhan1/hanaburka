"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/lib/actions/products";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (!confirm("Delete this product? This cannot be undone.")) return;
        startTransition(async () => {
          await deleteProduct(productId);
          router.refresh();
        });
      }}
      className="text-rose underline"
    >
      Delete
    </button>
  );
}
