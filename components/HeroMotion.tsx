"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import MagneticButton from "@/components/motion/MagneticButton";
import { useIsTouchDevice } from "@/components/motion/useIsTouchDevice";

type HeroContent = {
  heading?: string;
  description?: string;
  image_url?: string; // legacy single-image field, kept for backward compatibility
  images?: string[];
  primary_button?: { label: string; href: string };
  secondary_button?: { label: string; href: string };
};

function HeroSlideshow({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (images.length <= 1 || shouldReduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length, shouldReduceMotion]);

  return (
    <>
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <Image
            src={images[index]}
            alt="Hana Burka hero"
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <div className="absolute bottom-6 right-6 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-ivory" : "w-1.5 bg-ivory/50"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}

// The one orchestrated, non-user-triggered sequence on the whole site:
// a full-viewport hero, heading reveals word-by-word over the image, the
// background reveals blur-to-sharp with a slow zoom and drifts on parallax
// as you scroll past it. Everywhere else on the site, motion only
// responds to what a person does.
export default function HeroMotion({ content }: { content: HeroContent }) {
  const shouldReduceMotion = useReducedMotion();
  const heading = content.heading?.trim() ? content.heading : "ELEGANCE IN MODESTY";
  const words = heading.split(" ");
  const images = content.images?.length
    ? content.images
    : content.image_url
    ? [content.image_url]
    : [];

  const sectionRef = useRef<HTMLElement>(null);
  const isTouch = useIsTouchDevice();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], isTouch ? ["0%", "0%"] : ["0%", "15%"]);

  const heroContent = (
    <div className="relative z-10 h-full flex flex-col justify-end md:justify-center px-6 md:px-16 pb-16 md:pb-0 max-w-3xl">
      <h1 className="text-4xl sm:text-5xl md:text-7xl leading-[1.05] mb-5 text-ivory overflow-hidden">
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
            <motion.span
              className="inline-block"
              initial={shouldReduceMotion ? undefined : { y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </h1>

      <motion.div
        className="h-px bg-gold mb-6 origin-left"
        initial={shouldReduceMotion ? undefined : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, delay: 0.1 + words.length * 0.08 + 0.1, ease: [0.65, 0, 0.35, 1] }}
        style={{ width: "72px" }}
      />

      <motion.p
        className="text-ivory/85 max-w-md text-base md:text-lg leading-relaxed mb-8"
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 + words.length * 0.08 + 0.25 }}
      >
        {content.description ??
          "Discover beautifully crafted burkas designed for comfort, confidence and everyday elegance."}
      </motion.p>

      <motion.div
        className="flex flex-wrap gap-4"
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 + words.length * 0.08 + 0.4 }}
      >
        <MagneticButton
          href={content.primary_button?.href ?? "/shop"}
          className="inline-block bg-ivory text-espresso px-8 py-3 text-sm tracking-wide"
        >
          {content.primary_button?.label ?? "SHOP NOW"}
        </MagneticButton>
        <MagneticButton
          href={content.secondary_button?.href ?? "/collections"}
          className="inline-block border border-ivory text-ivory px-8 py-3 text-sm tracking-wide transition-colors hover:bg-ivory hover:text-espresso"
        >
          {content.secondary_button?.label ?? "EXPLORE COLLECTION"}
        </MagneticButton>
      </motion.div>
    </div>
  );

  // -mt-20 / md:-mt-24 below pulls the hero up underneath the transparent
  // navbar. These MUST equal the navbar's fixed h-20 / md:h-24 in
  // NavbarClient — too much and the hero swallows the announcement bar,
  // too little and an ivory strip shows through.
  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[100svh] min-h-[560px] overflow-hidden bg-espresso -mt-20 md:-mt-24"
    >
      {images.length > 0 ? (
        <motion.div
          className="absolute inset-0"
          style={shouldReduceMotion ? undefined : { y: parallaxY }}
          initial={shouldReduceMotion ? undefined : { scale: 1.1, x: 10 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ duration: 1.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={shouldReduceMotion ? undefined : { filter: "blur(16px)" }}
            animate={{ filter: "blur(0px)" }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            className="relative w-full h-[118%]"
          >
            <motion.div
              className="w-full h-full relative"
              animate={shouldReduceMotion ? undefined : { y: [0, -4, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
            >
              <HeroSlideshow images={images} />
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6 bg-gradient-to-br from-espresso via-charcoal to-espresso">
          <svg className="w-8 h-8 text-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h.01M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
          </svg>
          <p className="text-ivory/70 text-sm">
            No hero photo yet — add one from{" "}
            <span className="text-gold">Admin → Homepage → Hero Section</span>
          </p>
        </div>
      )}

      {/* Gradient overlay for text legibility over the photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/25 to-espresso/10 md:from-espresso/70 md:via-espresso/10 md:to-transparent" />

      {heroContent}

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-ivory/60 z-10"
        initial={shouldReduceMotion ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <span className="text-[10px] tracking-[0.2em]">SCROLL</span>
        <motion.span
          className="w-px h-8 bg-ivory/50"
          animate={shouldReduceMotion ? undefined : { scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />
      </motion.div>
    </section>
  );
}
