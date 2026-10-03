"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useIsTouchDevice } from "@/components/motion/useIsTouchDevice";

export default function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  // On touch devices the same reveal has to happen many more times per
  // session (small viewport → more sections cross the fold per scroll),
  // so a desktop-length 0.6s fade reads as sluggish. Shorter and with a
  // smaller travel distance feels responsive instead of decorative.
  const isTouch = useIsTouchDevice();

  if (shouldReduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: isTouch ? 14 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: isTouch ? 0.35 : 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
