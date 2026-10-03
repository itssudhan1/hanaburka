"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCartDrawer } from "@/components/cart/CartDrawerContext";
import CartItemRow from "@/components/cart/CartItemRow";
import StaggerGroup from "@/components/motion/StaggerGroup";
import { getCartItems } from "@/lib/actions/cart";

type CartData = Awaited<ReturnType<typeof getCartItems>>;

export default function CartDrawer() {
  const { isOpen, closeDrawer } = useCartDrawer();
  const [data, setData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);

  function refetch() {
    return getCartItems().then(setData);
  }

  // Refetch every time it opens rather than once on mount — quantity/save
  // changes made elsewhere (or in a previous open of the drawer itself)
  // need to show up, and this is a quick-view, not a page that stays
  // mounted long enough to need live sync.
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    refetch().finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [closeDrawer]);

  // Prevent the page behind the drawer from scrolling while it's open.
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-espresso/40 z-[60]"
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Your bag"
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-ivory z-[61] flex flex-col shadow-[-8px_0_30px_rgba(36,28,24,0.2)]"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-mocha/15">
              <h2 className="text-lg text-espresso">Your Bag</h2>
              <button onClick={closeDrawer} aria-label="Close bag" className="p-1 hover:text-rose transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {loading || !data ? (
                <div className="py-16 text-center text-charcoal/50 text-sm">Loading...</div>
              ) : !data.signedIn ? (
                <div className="py-16 text-center">
                  <p className="text-charcoal/70 mb-6">Sign in to view your bag.</p>
                  <Link
                    href="/login"
                    onClick={closeDrawer}
                    className="inline-block bg-espresso text-ivory px-8 py-3 text-sm tracking-wide hover:bg-charcoal transition-colors"
                  >
                    SIGN IN
                  </Link>
                </div>
              ) : data.active.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-charcoal/60 mb-6">Your bag is empty.</p>
                  <Link
                    href="/shop"
                    onClick={closeDrawer}
                    className="inline-block bg-espresso text-ivory px-8 py-3 text-sm tracking-wide hover:bg-charcoal transition-colors"
                  >
                    CONTINUE SHOPPING
                  </Link>
                </div>
              ) : (
                <StaggerGroup className="flex flex-col">
                  {data.active.map((item: any) => (
                    <CartItemRow key={item.id} item={item} onChange={refetch} />
                  ))}
                </StaggerGroup>
              )}
            </div>

            {data?.signedIn && data.active.length > 0 && (
              <div className="border-t border-mocha/15 px-6 py-5">
                <div className="flex justify-between text-sm mb-4">
                  <span>Subtotal</span>
                  <span>₹{data.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="block text-center w-full bg-espresso text-ivory py-3 text-sm tracking-wide hover:bg-charcoal transition-colors mb-2"
                >
                  CHECKOUT
                </Link>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="block text-center text-sm text-charcoal/70 underline"
                >
                  View Full Bag
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
