"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// Desktop-only expanding search: click the icon, an input grows out to its
// left, Enter navigates to /search?q=... Escape or clicking away collapses
// it again. Mobile keeps a plain link straight to /search — an inline
// expand has nowhere to go next to the cart + hamburger icons on a small
// screen, so it isn't just a copy of this component at a smaller size.
export default function NavSearch() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (open && wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  function submit() {
    const q = value.trim();
    setOpen(false);
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <div ref={wrapRef} className="flex items-center">
      <AnimatePresence initial={false}>
        {open && (
          <motion.input
            ref={inputRef}
            initial={shouldReduceMotion ? { opacity: 0 } : { width: 0, opacity: 0 }}
            animate={{ width: 180, opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Search..."
            className="border-b border-mocha/40 bg-transparent text-sm px-1 py-1 mr-2 focus:outline-none focus:border-rose"
          />
        )}
      </AnimatePresence>
      <button
        onClick={() => (open ? submit() : setOpen(true))}
        aria-label="Search"
        className="hover:text-rose transition-all hover:scale-110 inline-block"
      >
        <SearchIcon />
      </button>
    </div>
  );
}
