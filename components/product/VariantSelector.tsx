"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/actions/cart";
import { flyToCart } from "@/components/motion/flyToCart";

type Variant = {
  id: string;
  colour: string | null;
  size: string | null;
  price: number | null;
  stock: number;
  sku: string | null;
};

export default function VariantSelector({
  variants,
  basePrice,
  showBuyNow = true,
  imageUrl,
}: {
  variants: Variant[];
  basePrice: number;
  showBuyNow?: boolean;
  imageUrl?: string;
}) {
  const colours = useMemo(
    () => Array.from(new Set(variants.map((v) => v.colour).filter(Boolean))),
    [variants]
  );
  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size).filter(Boolean))),
    [variants]
  );

  const [colour, setColour] = useState<string | null>(colours[0] ?? null);
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [isBuyNowPending, startBuyNowTransition] = useTransition();
  const [addError, setAddError] = useState<string | null>(null);
  const [buyNowError, setBuyNowError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const selectedVariant = variants.find(
    (v) => v.colour === colour && v.size === size
  );

  const price = selectedVariant?.price ?? basePrice;
  const inStock = (selectedVariant?.stock ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div className="text-2xl text-espresso">
        ₹{price.toLocaleString("en-IN")}
      </div>

      {colours.length > 1 && (
        <div>
          <p className="text-sm text-charcoal/70 mb-2">Colour</p>
          <div className="flex gap-2 flex-wrap">
            {colours.map((c) => (
              <button
                key={c}
                onClick={() => setColour(c)}
                className={`px-4 py-2 text-sm border ${
                  colour === c
                    ? "border-espresso bg-espresso text-ivory"
                    : "border-mocha/30 text-charcoal"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="text-sm text-charcoal/70 mb-2">Size</p>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-4 py-2 text-sm border ${
                  size === s
                    ? "border-espresso bg-espresso text-ivory"
                    : "border-mocha/30 text-charcoal"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <p className="text-sm text-charcoal/70">Quantity</p>
        <div className="flex items-center border border-mocha/30">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="px-4">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-1"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <p className={`text-sm ${inStock ? "text-mocha" : "text-rose"}`}>
        {selectedVariant
          ? inStock
            ? "In stock"
            : "Out of stock"
          : "Select colour and size"}
      </p>

      {/* Buy Now adds to the bag and sends the customer straight to
          checkout, which places the order via WhatsApp by default (see
          getCheckoutMode) — same trackable order flow as Add to Bag. */}
      <div className="flex flex-col gap-3">
        <button
          ref={addButtonRef}
          disabled={!selectedVariant || !inStock || isPending}
          onClick={() => {
            if (!selectedVariant) return;
            setAddError(null);
            startTransition(async () => {
              try {
                await addToCart(selectedVariant.id, quantity);
                // Only plays once the add is actually confirmed — firing
                // this before the server responds could show a success
                // animation right before an error message (e.g. session
                // expired, out of stock by the time it lands).
                if (addButtonRef.current) flyToCart(addButtonRef.current, imageUrl);
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
              } catch (err: any) {
                if (err.message?.includes("Sign in")) {
                  router.push("/login");
                  return;
                }
                setAddError(err.message ?? "Could not add to bag");
              }
            });
          }}
          className="group bg-espresso text-ivory px-8 py-3 text-sm tracking-wide transition-all duration-200 hover:bg-charcoal hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {isPending ? (
            "ADDING..."
          ) : added ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-scale-in">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              ADDED TO BAG
            </>
          ) : (
            <>
              ADD TO BAG
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition-transform duration-200 group-hover:translate-x-1">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
        {addError && <p className="text-rose text-sm">{addError}</p>}
        {showBuyNow && (
          <button
            disabled={!selectedVariant || !inStock || isBuyNowPending}
            onClick={() => {
              if (!selectedVariant) return;
              setBuyNowError(null);
              startBuyNowTransition(async () => {
                try {
                  await addToCart(selectedVariant.id, quantity);
                  router.push("/checkout");
                } catch (err: any) {
                  if (err.message?.includes("Sign in")) {
                    router.push("/login");
                    return;
                  }
                  setBuyNowError(err.message ?? "Could not proceed");
                }
              });
            }}
            className="group border border-espresso text-espresso px-8 py-3 text-sm tracking-wide transition-all duration-200 hover:bg-espresso hover:text-ivory hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-transparent disabled:hover:text-espresso flex items-center justify-center gap-2"
          >
            {isBuyNowPending ? (
              "PROCESSING..."
            ) : (
              <>
                BUY NOW
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition-transform duration-200 group-hover:translate-x-1">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        )}
        {buyNowError && <p className="text-rose text-sm">{buyNowError}</p>}
      </div>
    </div>
  );
}
