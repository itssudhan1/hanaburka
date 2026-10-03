"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useIsTouchDevice } from "@/components/motion/useIsTouchDevice";

const MotionLink = motion(Link);

export default function MagneticButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (shouldReduceMotion || isTouch) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    // Cap the pull so it feels magnetic, not chaotic.
    setOffset({ x: relX * 0.25, y: relY * 0.35 });
  }

  return (
    <MotionLink
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 150, damping: 12, mass: 0.4 }}
      className={className}
    >
      {children}
    </MotionLink>
  );
}
