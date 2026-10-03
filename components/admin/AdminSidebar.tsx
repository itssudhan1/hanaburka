"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutButton from "@/components/auth/LogoutButton";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit-log", label: "Audit Log" },
];

export default function AdminSidebar({ role }: { role: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-espresso text-ivory rounded hover:bg-charcoal transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 md:w-56 flex-shrink-0 bg-espresso text-ivory min-h-screen p-4 md:p-6 transition-transform duration-300 transform z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } md:translate-x-0 w-56 overflow-y-auto`}
      >
        <div className="mb-8">
          <div className="font-display text-lg md:text-xl mb-1">HANA BURKA</div>
          <p className="text-xs text-ivory/50">Admin · {role}</p>
        </div>

        <nav className="space-y-1 mb-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block text-sm py-2.5 px-3 text-ivory/80 hover:text-gold hover:bg-white/10 rounded transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-ivory/20 pt-4">
          <LogoutButton className="text-sm underline text-ivory/60 hover:text-gold transition-colors" />
        </div>
      </aside>
    </>
  );
}
