"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useIsTouchDevice } from "@/components/motion/useIsTouchDevice";

export default function CategoryTile({
  category,
}: {
  category: { id: string; name: string; slug: string; image_url: string | null };
}) {
  const [loaded, setLoaded] = useState(false);
  const isTouch = useIsTouchDevice();
  const [pressed, setPressed] = useState(false);
  const touchActive = isTouch && pressed;

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      onTouchStart={() => isTouch && setPressed(true)}
      onTouchEnd={() => isTouch && setTimeout(() => setPressed(false), 500)}
      className={`group text-center block [perspective:800px] ${touchActive ? "is-active" : ""}`}
    >
      <div className="aspect-[4/5] md:aspect-square bg-mocha/10 mb-3 relative overflow-hidden transition-transform duration-500 ease-out group-hover:[transform:rotate3d(0.3,1,0,8deg)] group-hover:shadow-[0_16px_36px_-10px_rgba(36,28,24,0.3)] group-[.is-active]:[transform:rotate3d(0.3,1,0,8deg)] group-[.is-active]:shadow-[0_16px_36px_-10px_rgba(36,28,24,0.3)]">
        {category.image_url ? (
          <>
            {!loaded && <div className="skeleton absolute inset-0" />}
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 48vw, 33vw"
              onLoad={() => setLoaded(true)}
              className={`object-cover transition-all duration-700 ease-out group-hover:scale-110 group-[.is-active]:scale-110 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-mocha/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <circle cx="8.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M21 15l-5-4-4 3-3-2-6 5" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <span className="text-[10px] tracking-wide">Image coming soon</span>
          </div>
        )}
        <div className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/10 group-[.is-active]:bg-espresso/10 transition-colors duration-500" />
      </div>
      <span className="inline-flex items-center gap-1 text-sm md:text-base text-charcoal transition-all duration-300 group-hover:text-rose group-hover:translate-x-0.5 group-[.is-active]:text-rose group-[.is-active]:translate-x-0.5">
        {category.name}
        <svg
          width="11" height="11" viewBox="0 0 24 24" fill="none"
          className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-[.is-active]:opacity-100 group-[.is-active]:translate-x-0 transition-all duration-300"
        >
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}
