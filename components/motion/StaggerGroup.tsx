"use client";

import { Children } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useIsTouchDevice } from "@/components/motion/useIsTouchDevice";

const container = (stagger: number) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger },
  },
});

const item = (duration: number, distance: number) => ({
  hidden: { opacity: 0, y: distance },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, ease: [0.22, 1, 0.36, 1] },
  },
});

export default function StaggerGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  // Same reasoning as Reveal: grids on mobile are often 2-up and long
  // (a full product grid), so a slow desktop-paced stagger makes the
  // bottom rows visibly lag behind the scroll instead of feeling snappy.
  const isTouch = useIsTouchDevice();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={container(isTouch ? 0.05 : 0.08)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {Children.map(children, (child) => (
        <motion.div variants={item(isTouch ? 0.3 : 0.5, isTouch ? 16 : 28)}>{child}</motion.div>
      ))}
    </motion.div>
  );
}
