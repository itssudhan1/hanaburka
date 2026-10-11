"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toggleWishlist } from "@/lib/actions/wishlist";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}>
      <path
        d="M12 21s-7.5-4.6-10-9.1C.4 8.6 2 5 5.5 5c2 0 3.4 1.1 4.2 2.2C10.5 8.3 10.7 8.6 12 8.6c1.3 0 1.5-.3 2.3-1.4C15.1 6.1 16.5 5 18.5 5 22 5 23.6 8.6 22 11.9 19.5 16.4 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function WishlistButton({
  productId,
  initialWishlisted = false,
}: {
  productId: string;
  initialWishlisted?: boolean;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            const result = await toggleWishlist(productId);
            if (!result.ok) {
              if (result.code === "NOT_SIGNED_IN") router.push("/login");
              return;
            }
            setWishlisted(result.wishlisted);
          } catch {
            // Unexpected failure (network drop) — leave the heart as it was.
          }
        })
      }
      className="flex items-center gap-2 text-sm text-charcoal/70 hover:text-rose transition-colors"
    >
      <motion.span
        className={wishlisted ? "text-rose" : "text-charcoal/60"}
        animate={
          shouldReduceMotion
            ? undefined
            : wishlisted
            ? { scale: [1, 1.2, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <HeartIcon filled={wishlisted} />
      </motion.span>
      {wishlisted ? "In Wishlist" : "Add to Wishlist"}
    </button>
  );
}
