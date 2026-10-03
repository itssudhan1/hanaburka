"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function TextReveal({
  children,
  as: Tag = "span",
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "span";
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    const Static = Tag as any;
    return <Static className={className}>{children}</Static>;
  }

  const Wrapper = Tag as any;

  return (
    <Wrapper className={`overflow-hidden inline-block ${className ?? ""}`}>
      <motion.span
        className="inline-block"
        initial={{ y: "100%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </Wrapper>
  );
}
