"use client";

import { useEffect, useState } from "react";

/**
 * True on devices whose primary input is touch (no real hover/cursor).
 * Used to skip cursor-following effects (magnetic buttons, image hover-zoom,
 * parallax) that don't make sense — and cost real performance — on phones.
 */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
    setIsTouch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isTouch;
}
