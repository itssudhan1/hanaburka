import Link from "next/link";
import Image from "next/image";
import StaggerGroup from "@/components/motion/StaggerGroup";
import { getWhatsAppNumber, buildWhatsAppLink, INSTAGRAM_URL, getBusinessInfo, getCustomerCareLinks } from "@/lib/config";

const shopLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/new-arrivals", label: "New Arrivals" },
];

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.06-1.33A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8.5 8.8c.2-.6.7-.6 1-.6h.5c.2 0 .4 0 .6.5.2.5.7 1.7.7 1.9s0 .3-.1.5c-.1.2-.2.3-.4.5-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1 .2-.2.4-.2.6-.1l1.7.8c.2.1.4.2.4.4.1.5-.2 1.3-.9 1.8-.6.5-1.4.8-2.2.7-.6 0-1.9-.2-3.6-1.2-3-1.7-4.4-4.4-4.5-4.6-.1-.2-.9-1.2-.9-2.3 0-1.1.6-1.6.8-1.8z"
        fill="currentColor"
      />
    </svg>
  );
}

export default async function Footer() {
  const [whatsappNumber, BUSINESS_INFO, customerCareLinks] = await Promise.all([
    getWhatsAppNumber(),
    getBusinessInfo(),
    getCustomerCareLinks(),
  ]);
  const whatsappHref = buildWhatsAppLink(whatsappNumber, "Hi! I have a question.");

  return (
    <footer className="border-t border-mocha/15 bg-ivory">
      <StaggerGroup className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <Image src="/logo.png" alt="Hana Burka" width={32} height={48} className="h-8 w-auto" />
            <span className="font-display text-2xl text-espresso">
              {BUSINESS_INFO.name}
            </span>
          </div>
          <p className="text-charcoal/60 text-sm mb-4">Elegant · Modest · Timeless</p>
          <p className="text-sm text-charcoal/70 leading-relaxed mb-3">
            {BUSINESS_INFO.address}
          </p>
          <p className="text-sm text-charcoal/70">
            <a href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, "")}`} className="hover:text-rose transition-colors">
              {BUSINESS_INFO.phone}
            </a>
            {" · "}
            <a href={`tel:${BUSINESS_INFO.phoneSecondary.replace(/\s/g, "")}`} className="hover:text-rose transition-colors">
              {BUSINESS_INFO.phoneSecondary}
            </a>
          </p>
        </div>

        <div>
          <h4 className="text-sm text-espresso mb-4 font-body font-semibold">Shop</h4>
          <ul className="space-y-2">
            {shopLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-charcoal/70 hover:text-rose transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm text-espresso mb-4 font-body font-semibold">Customer Care</h4>
          <ul className="space-y-2">
            {customerCareLinks.map((link) => (
              <li key={link.url}>
                <Link href={link.url} className="text-sm text-charcoal/70 hover:text-rose transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm text-espresso mb-4 font-body font-semibold">Follow Us</h4>
          <StaggerGroup className="flex gap-3">
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-mocha/25 text-charcoal/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose hover:text-rose hover:shadow-[0_4px_12px_-4px_rgba(185,143,136,0.5)]"
              >
                <WhatsAppIcon />
              </a>
            )}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow on Instagram"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-mocha/25 text-charcoal/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose hover:text-rose hover:shadow-[0_4px_12px_-4px_rgba(185,143,136,0.5)]"
            >
              <InstagramIcon />
            </a>
          </StaggerGroup>
        </div>
      </StaggerGroup>
      <div className="divider-gold" />
      <p className="text-center text-xs text-charcoal/50 py-6">
        © {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved.
      </p>
    </footer>
  );
}
