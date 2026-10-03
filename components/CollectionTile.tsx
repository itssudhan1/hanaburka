"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useIsTouchDevice } from "@/components/motion/useIsTouchDevice";

export default function CollectionTile({
  collection,
}: {
  collection: { id: string; name: string; slug: string; image_url: string | null };
}) {
  const [loaded, setLoaded] = useState(false);
  const isTouch = useIsTouchDevice();
  const [pressed, setPressed] = useState(false);
  const touchActive = isTouch && pressed;

  return (
    <Link
      href={`/shop?collection=${collection.slug}`}
      onTouchStart={() => isTouch && setPressed(true)}
      onTouchEnd={() => isTouch && setTimeout(() => setPressed(false), 500)}
      className={`group block [perspective:800px] ${touchActive ? "is-active" : ""}`}
    >
      <div className="aspect-[4/5] md:aspect-[4/3] bg-mocha/10 mb-3 relative overflow-hidden transition-transform duration-500 ease-out group-hover:[transform:rotate3d(0.3,1,0,8deg)] group-hover:shadow-[0_16px_36px_-10px_rgba(36,28,24,0.3)] group-[.is-active]:[transform:rotate3d(0.3,1,0,8deg)] group-[.is-active]:shadow-[0_16px_36px_-10px_rgba(36,28,24,0.3)]">
        {collection.image_url ? (
          <>
            {!loaded && <div className="skeleton absolute inset-0" />}
            <Image
              src={collection.image_url}
              alt={collection.name}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              onLoad={() => setLoaded(true)}
              className={`object-cover group-hover:scale-110 group-[.is-active]:scale-110 transition-all duration-700 ease-out ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mocha/40 text-xs">
            No image
          </div>
        )}
      </div>
      <p className="text-espresso group-hover:text-rose group-[.is-active]:text-rose transition-colors text-sm md:text-base">{collection.name}</p>
    </Link>
  );
}
