"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import {
  updateCartItemQuantity,
  removeCartItem,
  toggleSaveForLater,
} from "@/lib/actions/cart";

type Item = {
  id: string;
  quantity: number;
  saved_for_later: boolean;
  variant: {
    id: string;
    colour: string | null;
    size: string | null;
    price: number | null;
    stock: number;
    product: {
      name: string;
      slug: string;
      price: number;
    };
    image_url: string | null;
  };
};

export default function CartItemRow({
  item,
  onChange,
}: {
  item: Item;
  // Optional: called after a mutation succeeds. The full /cart page
  // doesn't need this — its Server Component re-renders with fresh data
  // via revalidatePath automatically. The cart drawer holds its own data
  // in local client state (fetched once when it opens), which
  // revalidatePath has no effect on, so it needs an explicit nudge to
  // refetch or its list/subtotal would silently go stale after an edit.
  onChange?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);
  const unitPrice = item.variant.price ?? item.variant.product.price;

  return (
    <div className="flex gap-3 sm:gap-4 py-6 border-b border-mocha/15">
      <div className="w-20 h-24 bg-mocha/10 flex-shrink-0 overflow-hidden relative">
        {item.variant.image_url && (
          <>
            {!loaded && <div className="skeleton absolute inset-0" />}
            <Image
              src={item.variant.image_url}
              alt=""
              fill
              sizes="80px"
              onLoad={() => setLoaded(true)}
              className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
            />
          </>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <p className="text-espresso truncate">{item.variant.product.name}</p>
          <p className="text-sm text-espresso flex-shrink-0 sm:hidden">
            ₹{(unitPrice * item.quantity).toLocaleString("en-IN")}
          </p>
        </div>
        <p className="text-sm text-charcoal/60">
          {item.variant.colour} / {item.variant.size}
        </p>
        <p className="text-sm mt-1">₹{unitPrice.toLocaleString("en-IN")}</p>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-sm">
          <div className="flex items-center border border-mocha/30">
            <button
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1));
                  onChange?.();
                })
              }
              className="px-3 py-1"
            >
              −
            </button>
            <span className="px-3">{item.quantity}</span>
            <button
              disabled={isPending || item.quantity >= item.variant.stock}
              onClick={() =>
                startTransition(async () => {
                  await updateCartItemQuantity(item.id, item.quantity + 1);
                  onChange?.();
                })
              }
              className="px-3 py-1"
            >
              +
            </button>
          </div>

          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await toggleSaveForLater(item.id, !item.saved_for_later);
                onChange?.();
              })
            }
            className="underline text-charcoal/70"
          >
            {item.saved_for_later ? "Move to cart" : "Save for later"}
          </button>

          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await removeCartItem(item.id);
                onChange?.();
              })
            }
            className="underline text-rose"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="hidden sm:block text-sm text-espresso flex-shrink-0">
        ₹{(unitPrice * item.quantity).toLocaleString("en-IN")}
      </div>
    </div>
  );
}
