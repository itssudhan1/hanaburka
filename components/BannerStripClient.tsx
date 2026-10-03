"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useIsTouchDevice } from "@/components/motion/useIsTouchDevice";

type Banner = { id: string; title: string | null; image_url: string; link_url: string | null };

function BannerCard({ banner, priority = false }: { banner: Banner; priority?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], isTouch ? ["0%", "0%"] : ["-6%", "6%"]);

  const content = (
    <div ref={ref} className="relative aspect-[16/7] overflow-hidden bg-mocha/10">
      <motion.div
        className="absolute inset-0"
        style={shouldReduceMotion ? undefined : { y }}
        initial={{ scale: 1.1 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {!loaded && <div className="skeleton absolute inset-0" />}
        <Image
          src={banner.image_url}
          alt={banner.title ?? ""}
          fill
          priority={priority}
          onLoad={() => setLoaded(true)}
          className={`object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </motion.div>
      {banner.title && (
        <motion.span
          className="absolute bottom-4 left-4 bg-ivory/90 text-espresso text-sm px-3 py-1"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {banner.title}
        </motion.span>
      )}
    </div>
  );

  return banner.link_url ? <Link href={banner.link_url}>{content}</Link> : content;
}

export default function BannerStripClient({ banners }: { banners: Banner[] }) {
  return (
    <div className={`grid gap-4 ${banners.length > 1 ? "md:grid-cols-2" : ""}`}>
      {banners.map((b, i) => (
        <BannerCard key={b.id} banner={b} priority={i === 0} />
      ))}
    </div>
  );
}
