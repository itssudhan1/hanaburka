"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export default function FloatingWhatsApp({ href }: { href: string | null }) {
  const shouldReduceMotion = useReducedMotion();

  if (!href) return null;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={shouldReduceMotion ? undefined : { scale: 0, opacity: 0 }}
      animate={shouldReduceMotion ? undefined : { scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.1 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-[0_8px_24px_-6px_rgba(37,211,102,0.6)] overflow-hidden"
    >
      <Image src="/whatsapp-icon.webp" alt="Chat on WhatsApp" fill sizes="56px" className="object-cover" />
    </motion.a>
  );
}
