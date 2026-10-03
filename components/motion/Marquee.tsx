"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Seamless infinite marquee. The trick to no visible jump: render the
 * message list TWICE back-to-back inside a flex row, then animate the
 * whole row left by exactly -50% (one full copy's width). When it resets
 * to 0%, the second copy is pixel-identical to where the first started,
 * so the loop is invisible.
 */
export default function Marquee({ messages }: { messages: string[] }) {
  const shouldReduceMotion = useReducedMotion();

  const track = (
    <>
      {messages.map((msg, i) => (
        <span key={i} className="inline-flex items-center whitespace-nowrap">
          <span className="mx-6">{msg}</span>
          <span className="text-gold/70">•</span>
        </span>
      ))}
    </>
  );

  if (shouldReduceMotion || messages.length <= 1) {
    return (
      <div className="overflow-hidden">
        <div className="flex justify-center py-2 text-xs tracking-[0.15em]">
          {messages[0]}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden group">
      <div
        className="flex w-max py-2 text-xs tracking-[0.15em] animate-marquee group-hover:[animation-play-state:paused]"
      >
        <div className="flex">{track}</div>
        <div className="flex" aria-hidden="true">{track}</div>
      </div>
    </div>
  );
}
