"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import NavSearch from "@/components/NavSearch";
import { useCartDrawer } from "@/components/cart/CartDrawerContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/about", label: "About" },
];

const actionLinks = [
  { href: "/account", label: "Account" },
  { href: "/wishlist", label: "Wishlist" },
];

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 8V6.5a3 3 0 016 0V8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6.2 8h11.6l1 12.2a1.8 1.8 0 01-1.8 1.8H7a1.8 1.8 0 01-1.8-1.8L6.2 8z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="w-6 h-5 relative flex flex-col justify-between">
      <span
        className={`block h-px bg-espresso transition-transform duration-300 ${
          open ? "translate-y-[9px] rotate-45" : ""
        }`}
      />
      <span
        className={`block h-px bg-espresso transition-opacity duration-300 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`block h-px bg-espresso transition-transform duration-300 ${
          open ? "-translate-y-[9px] -rotate-45" : ""
        }`}
      />
    </div>
  );
}

export default function NavbarClient({ cartCount }: { cartCount: number }) {
  const { openDrawer } = useCartDrawer();
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes, and lock background
  // scroll while it's open.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-ivory/80 backdrop-blur-md border-b border-mocha/15 shadow-[0_1px_20px_-8px_rgba(36,28,24,0.15)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Height is FIXED at h-20 / md:h-24 and must stay in sync with the
          -mt-20 / md:-mt-24 on HeroMotion's <section>. If you change one,
          change the other — otherwise the hero either covers the
          announcement bar or leaves an ivory gap below it. */}
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-20 md:h-24">
        <motion.div
          animate={shouldReduceMotion ? undefined : { scale: scrolled ? 0.94 : 1 }}
          transition={{ duration: 0.4 }}
        >
          <Link href="/" className="flex items-center gap-2 md:gap-2.5">
            <Image
              src="/logo.png"
              alt="Hana Burka"
              width={36}
              height={54}
              className="h-7 md:h-9 w-auto shrink-0"
              priority
            />
            <span className="font-display text-xl md:text-[26px] tracking-wide text-[#160F0C] font-semibold whitespace-nowrap [text-shadow:0_1px_2px_rgba(253,229,165,0.45)]">
              HANA BURKA
            </span>
          </Link>
        </motion.div>

        <nav className="hidden md:flex items-center gap-8 text-[15px] text-charcoal">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 hover:text-rose transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-px after:bg-rose after:transition-all after:duration-300 hover:after:w-full ${
                  active ? "text-espresso after:w-full" : "after:w-0"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop action links */}
        <div className="hidden md:flex items-center gap-5 text-charcoal">
          <NavSearch />
          {actionLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              className="hover:text-rose transition-all hover:scale-110 inline-block"
            >
              {link.label}
            </Link>
          ))}
          <button onClick={openDrawer} aria-label="Cart" data-cart-icon className="hover:text-rose transition-all hover:scale-110 inline-flex items-center gap-1 relative">
            Cart
            {cartCount > 0 && (
              <AnimatePresence mode="wait">
                <motion.span
                  key={cartCount}
                  initial={shouldReduceMotion ? undefined : { scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  ({cartCount})
                </motion.span>
              </AnimatePresence>
            )}
          </button>
        </div>

        {/* Mobile: search icon + cart icon + hamburger */}
        <div className="flex md:hidden items-center gap-4 text-espresso">
          <Link href="/search" aria-label="Search" className="p-1 active:scale-90 transition-transform">
            <SearchIcon />
          </Link>
          <button onClick={openDrawer} aria-label="Cart" data-cart-icon className="relative p-1 active:scale-90 transition-transform">
            <CartIcon />
            {cartCount > 0 && (
              <AnimatePresence mode="wait">
                <motion.span
                  key={cartCount}
                  initial={shouldReduceMotion ? undefined : { scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -top-1 -right-1 bg-rose text-ivory text-[10px] w-4 h-4 rounded-full flex items-center justify-center leading-none"
                >
                  {cartCount}
                </motion.span>
              </AnimatePresence>
            )}
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="p-1"
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-espresso/40 z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 right-0 z-40 bg-ivory border-b border-mocha/15 shadow-lg md:hidden pt-6 pb-8"
            >
              <div className="flex justify-end px-6 mb-4">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-charcoal/60 underline"
                >
                  Cancel
                </button>
              </div>
              <nav className="flex flex-col px-6">
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={shouldReduceMotion ? undefined : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="block py-3 text-lg text-espresso border-b border-mocha/10"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {actionLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={shouldReduceMotion ? undefined : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + (links.length + i) * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="block py-3 text-lg text-charcoal/80 border-b border-mocha/10"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
