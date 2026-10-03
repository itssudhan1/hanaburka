"use client";

import { createContext, useCallback, useContext, useState } from "react";

type CartDrawerContextValue = {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

// Mounted once in the shop layout, so it wraps every page (and therefore
// every page's own <Navbar />, which is where the cart icon that opens it
// lives). This is what lets the navbar's cart icon and the drawer UI
// coordinate without either being a parent of the other.
export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  return (
    <CartDrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) {
    throw new Error("useCartDrawer must be used within a CartDrawerProvider");
  }
  return ctx;
}
