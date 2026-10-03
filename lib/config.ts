import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

// These site_settings values are read on nearly every page (getWhatsAppNumber
// alone runs in the shared shop layout, so it was hitting Supabase on every
// single navigation) but only ever change when an admin edits Settings —
// realistically a handful of times a year. Caching them for 5 minutes cuts
// that repeated DB round-trip on every page load to almost nothing, while
// still picking up admin edits within 5 minutes without needing every admin
// save action wired up to invalidate a cache tag by hand.
//
// IMPORTANT: every function wrapped in unstable_cache below must use
// createPublicClient() (lib/supabase/public.ts), never the cookie-based
// createClient() from lib/supabase/server.ts. Next.js forbids touching
// cookies()/headers() inside a cache scope — using the cookie-based client
// here throws "used cookies inside a function cached with unstable_cache"
// at runtime on every request. These lookups are all public site_settings
// rows (RLS: `using (true)`), so they never needed the visitor's session
// in the first place.
const SETTINGS_CACHE_OPTIONS = { revalidate: 300 };

// Single source of truth for values used in multiple places across the
// site (footer, product page, checkout, contact page, cart, etc).
// Never hardcode these directly in a component.

// Instagram has no admin-editable DB setting (yet), so it's env-only —
// safe to import NEXT_PUBLIC_INSTAGRAM_URL directly in client components.
export const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/hanaburka/";

// Real fallback numbers, in case the admin-editable DB setting is empty.
// The number configurable in Admin → Settings always takes priority.
const FALLBACK_WHATSAPP_NUMBER = "917418353535";

const FALLBACK_BUSINESS_INFO = {
  name: "HANA BURKA",
  address: "NO-135 (Old No-64), Angappa Naicken St, Mannady, Chennai-600001",
  phone: "+91 74183 53535",
  phoneSecondary: "+91 96597 66610",
};

/**
 * Business name/address/phone are admin-editable (Settings → Business Info,
 * stored in site_settings) — same pattern as getWhatsAppNumber. Falls back
 * to the values above if the DB row is empty.
 */
export const getBusinessInfo = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "business_info")
      .single();

    const fromDb = data?.value as Partial<typeof FALLBACK_BUSINESS_INFO> | undefined;
    return { ...FALLBACK_BUSINESS_INFO, ...fromDb };
  },
  ["business-info"],
  SETTINGS_CACHE_OPTIONS
);

const FALLBACK_CUSTOMER_CARE_LINKS = [
  { label: "Contact", url: "/contact" },
  { label: "Shipping", url: "/shipping-policy" },
  { label: "Returns", url: "/return-policy" },
  { label: "Terms", url: "/terms" },
  { label: "Privacy", url: "/privacy-policy" },
];

/**
 * Footer "Customer Care" links are fully admin-editable (Settings →
 * Customer Care Links) — label and URL for each, add/remove/reorder.
 * Falls back to the default policy pages if never customized.
 */
export const getCustomerCareLinks = unstable_cache(
  async (): Promise<{ label: string; url: string }[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "footer_customer_care")
      .single();

    const links = (data?.value as { links?: { label: string; url: string }[] })?.links;
    return links?.length ? links : FALLBACK_CUSTOMER_CARE_LINKS;
  },
  ["customer-care-links"],
  SETTINGS_CACHE_OPTIONS
);

/**
 * Simple CMS for the static informational pages (About, Shipping/Return/
 * Privacy policy, Terms, Contact intro). Each page's editable content is
 * stored under its own site_settings key (page_content:<slug>) as
 * { title, body }. `defaultBody` is what shows until an admin edits it —
 * always the original placeholder copy, never invented per-call.
 */
export const getPageContent = unstable_cache(
  async (slug: string, defaultTitle: string, defaultBody: string) => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", `page_content:${slug}`)
      .single();

    const stored = data?.value as { title?: string; body?: string } | undefined;
    return {
      title: stored?.title || defaultTitle,
      body: stored?.body || defaultBody,
    };
  },
  ["page-content"],
  SETTINGS_CACHE_OPTIONS
);

/**
 * WhatsApp number is admin-editable (Settings → WhatsApp Number, stored in
 * site_settings) so it can be changed without a redeploy — that's real,
 * intentional functionality from an earlier phase, not something to
 * regress. This helper is the ONE place that reads it, falling back to
 * NEXT_PUBLIC_WHATSAPP_NUMBER if the DB value is empty. Every server
 * component that needs the number should call this instead of querying
 * site_settings directly.
 */
export const getWhatsAppNumber = unstable_cache(
  async (): Promise<string> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "whatsapp")
      .single();

    const fromDb = (data?.value as { number?: string })?.number;
    return fromDb || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || FALLBACK_WHATSAPP_NUMBER;
  },
  ["whatsapp-number"],
  SETTINGS_CACHE_OPTIONS
);

export function buildWhatsAppLink(number: string, message?: string) {
  if (!number) return null;
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
