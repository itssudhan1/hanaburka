"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useIsTouchDevice } from "@/components/motion/useIsTouchDevice";

export default function ImageGallery({
  images,
}: {
  images: { url: string; alt_text: string | null }[];
}) {
  const [active, setActive] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [zoomed, setZoomed] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();

  if (images.length === 0) {
    return (
      <div className="aspect-[4/5] bg-mocha/10 flex items-center justify-center text-mocha/40 text-sm">
        No images yet
      </div>
    );
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  return (
    <div>
      <div
        ref={frameRef}
        className={`aspect-[4/5] bg-mocha/10 mb-3 overflow-hidden relative ${isTouch ? "" : "cursor-zoom-in"}`}
        onMouseMove={isTouch ? undefined : handleMouseMove}
        onMouseEnter={isTouch ? undefined : () => setZoomed(true)}
        onMouseLeave={isTouch ? undefined : () => setZoomed(false)}
      >
        <AnimatePresence mode="wait">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            key={images[active].url}
            src={images[active].url}
            alt={images[active].alt_text ?? ""}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full object-cover"
            style={
              zoomed
                ? {
                    transform: "scale(1.8)",
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }
                : undefined
            }
          />
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActive(i)}
              className={`w-16 h-20 relative overflow-hidden border transition-colors ${
                i === active ? "border-espresso" : "border-mocha/20 hover:border-mocha/50"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
