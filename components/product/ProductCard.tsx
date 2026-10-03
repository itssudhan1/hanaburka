"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useIsTouchDevice } from "@/components/motion/useIsTouchDevice";

type CardProduct = {
  slug: string;
  name: string;
  price: number;
  mrp: number;
  is_bestseller?: boolean;
  is_new_arrival?: boolean;
  product_images?: { url: string; is_primary: boolean; sort_order?: number }[];
};

export default function ProductCard({ product }: { product: CardProduct }) {
  const [loaded, setLoaded] = useState(false);
  // group-hover: never fires on a touchscreen — there's no cursor to
  // hover with. On touch, a press instead toggles the "is-active" class,
  // which every group-hover: style below has a group-[.is-active]:
  // twin for, so the same swap/lift/label plays as tap feedback instead
  // of being permanently invisible on mobile.
  const isTouch = useIsTouchDevice();
  const [pressed, setPressed] = useState(false);
  const touchActive = isTouch && pressed;
  const sorted = [...(product.product_images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const primaryImage = sorted.find((img) => img.is_primary)?.url ?? sorted[0]?.url;
  const secondImage = sorted.find((img) => img.url !== primaryImage)?.url;

  const discountPct =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      onTouchStart={() => isTouch && setPressed(true)}
      onTouchEnd={() => isTouch && setTimeout(() => setPressed(false), 500)}
      className={`group block transition-transform duration-500 ease-out hover:-translate-y-1.5 ${
        touchActive ? "is-active -translate-y-1.5" : ""
      }`}
    >
      <div className="aspect-[3/4] bg-mocha/10 mb-3 relative overflow-hidden transition-shadow duration-500 group-hover:shadow-[0_20px_44px_-14px_rgba(36,28,24,0.28)] group-[.is-active]:shadow-[0_20px_44px_-14px_rgba(36,28,24,0.28)]">
        {primaryImage ? (
          <>
            {!loaded && <div className="skeleton absolute inset-0" />}
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 48vw, (max-width: 1024px) 33vw, 25vw"
              onLoad={() => setLoaded(true)}
              className={`object-cover transition-all duration-500 ease-out ${
                loaded ? "opacity-100" : "opacity-0"
              } ${
                secondImage
                  ? "group-hover:opacity-0 group-hover:scale-[1.03] group-[.is-active]:opacity-0 group-[.is-active]:scale-[1.03]"
                  : "group-hover:scale-[1.03] group-[.is-active]:scale-[1.03] duration-700"
              }`}
            />
            {secondImage && (
              <Image
                src={secondImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 48vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 scale-[1.03] group-hover:opacity-100 group-hover:scale-[1.03] group-[.is-active]:opacity-100 group-[.is-active]:scale-[1.03] transition-opacity duration-500 ease-out"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mocha/40 text-xs">
            No image
          </div>
        )}
        {(product.is_bestseller || product.is_new_arrival) && (
          <span className="absolute top-3 left-3 bg-espresso text-ivory text-xs px-2 py-1">
            {product.is_bestseller ? "Bestseller" : "New"}
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 bg-ivory/95 text-espresso text-xs tracking-wide text-center py-2 flex items-center justify-center gap-1.5 translate-y-full group-hover:translate-y-0 group-[.is-active]:translate-y-0 transition-transform duration-300 ease-out">
          VIEW PRODUCT
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            className="transition-transform duration-300 group-hover:translate-x-1 group-[.is-active]:translate-x-1"
          >
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <h3 className="text-[15px] sm:text-base leading-snug text-[#160F0C] font-medium mb-1 transition-colors group-hover:text-mocha group-[.is-active]:text-mocha">
        {product.name}
      </h3>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-espresso">₹{product.price.toLocaleString("en-IN")}</span>
        {discountPct > 0 && (
          <>
            <span className="text-charcoal/40 line-through">
              ₹{product.mrp.toLocaleString("en-IN")}
            </span>
            <span className="text-sale font-medium">{discountPct}% off</span>
          </>
        )}
      </div>
    </Link>
  );
}
