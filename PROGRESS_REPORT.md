# HANA BURKA — Phase 1 Report

## 1. What I implemented
- Full relational schema: 22 tables covering catalog, variants, inventory,
  cart, wishlist, orders, payments, shipments, returns, reviews, coupons,
  CMS (banners/homepage/settings), audit logs, newsletter.
- Row Level Security enabled on every table, with explicit policies:
  - Public can read only published/active catalog rows.
  - Customers can only read/write their own cart, wishlist, addresses, orders.
  - Reviews can only be inserted by a user who has a **delivered** order for
    that exact product (purchase-verified reviews, per your spec).
  - Admin tables (`admin_users`, `audit_logs`) are locked to admins only.
  - `is_admin()` / `is_super_admin()` SQL functions used across policies.
- Seed data: 5 categories, 9 collections, homepage CMS defaults
  (announcement bar, hero, "Why Hana" cards, newsletter block), and
  site settings (COD config, WhatsApp number placeholder, brand info).
- Next.js 14 + TypeScript project scaffold with three separate Supabase
  clients, matching the security model your spec asked for:
  - `lib/supabase/client.ts` — browser, anon key, RLS-bound.
  - `lib/supabase/server.ts` — server components/routes, user's session, RLS-bound.
  - `lib/supabase/admin.ts` — service_role key, **bypasses RLS**, server-only
    (guarded by the `server-only` package so it can't accidentally ship to
    the browser bundle).
- `lib/auth/admin-guard.ts` — `requireAdmin()` helper that every admin API
  route must call first. It re-checks `admin_users` on the server on every
  request — never trusts a role claimed by the client.
- `middleware.ts` — edge-level redirect for unauthenticated `/admin/*`
  requests. This is convenience only; `requireAdmin()` is the real gate.
- `.env.example` with your actual Supabase URL pre-filled.

## 2. Files
```
hana-burka/
├── supabase/migrations/
│   ├── 0001_init_schema.sql
│   ├── 0002_rls_policies.sql
│   └── 0003_seed.sql
├── lib/supabase/{client,server,admin}.ts
├── lib/auth/admin-guard.ts
├── middleware.ts
├── package.json, tsconfig.json
└── .env.example
```

## 3. Database changes
All three migration files need to be run, in order, against your Supabase
project (kivjcxpbcqmmowgdhico). See "Next step" below — I can run these for
you right now if you give me the go-ahead, or you can paste them into the
Supabase SQL Editor yourself.

## 4. Environment variables required
```
NEXT_PUBLIC_SUPABASE_URL=https://kivjcxpbcqmmowgdhico.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_SzXdCLNzt5TJQkBMF1L98w_UNn7Lss5
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Settings → API → Secret keys>
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
OPENAI_API_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

## 5. Remaining / not yet done
- No UI at all yet — that's Phase 2 (design system, navbar, footer, homepage).
- No auth flows wired up yet (email/password, Google login, admin login) —
  Phase 1 only sets up the database side of auth (`profiles`, `admin_users`,
  RLS). Actual sign-up/login pages come with Phase 2/3.
- No first admin user exists yet. Once migrations are run, you'll sign up
  a normal user through Supabase Auth, then I'll show you how to promote
  that user's UUID into `admin_users` with role `SUPER_ADMIN` — that's how
  you get your first admin login.
- Storage buckets (for product images) not yet created — coming with Phase 3
  (product/image management).

## 6. Next phase
**Phase 2**: brand design system (colours/typography from your spec), navbar,
footer, and the full homepage — built against `homepage_sections` and
`banners` so everything's editable from admin later, not hardcoded.

---

# Phase 2 Report

## 1. What I implemented
- Design tokens in `tailwind.config.ts`: Espresso/Mocha/Ivory/Rose/Gold/
  Charcoal exactly as specified, Cormorant Garamond (headings) + Manrope
  (body) loaded via `next/font/google`.
- Announcement bar, navbar, asymmetric editorial hero, category grid, "Why
  Hana" section, newsletter (with a working subscribe form wired to
  `newsletter_subscribers`), and footer.
- Every section that should be admin-editable reads live from Supabase
  (`homepage_sections`, `categories`) — nothing hardcoded, per your spec.
  Right now they render the seed defaults because there's no admin UI yet
  to change them (that's Phase 8/9) — but the data layer is real.

## 2. Files added
```
tailwind.config.ts, postcss.config.js, next.config.js
app/globals.css, app/layout.tsx, app/page.tsx
components/{AnnouncementBar,Navbar,Hero,CategoryGrid,WhyHana,Newsletter,Footer}.tsx
```

## 3. Database changes
None — Phase 2 only reads existing Phase 1 tables.

## 4. Environment variables required
No new ones. Still need `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID/SECRET`,
`OPENAI_API_KEY`, `NEXT_PUBLIC_WHATSAPP_NUMBER` filled in before later phases.

## 5. Remaining / not yet done
- Featured Products / New Arrivals / Best Sellers sections are commented out
  in `app/page.tsx` — they need real products, which don't exist until
  Phase 3. Not faked with placeholder products, per your instruction not to
  hardcode where DB data should be used.
- Mobile nav (bottom bar: Home/Shop/Search/Wishlist/Cart) not built yet —
  bundled into Phase 3 alongside the shop/product pages so it can link to
  real routes instead of stubs.
- No hero/category images uploaded yet — Supabase Storage bucket setup is
  part of Phase 3 (image management).
- Not yet runnable locally — you'll need to run `npm install` once you have
  the project on your machine (or in a GitHub repo + Vercel), since I can't
  reach the npm registry with your specific lockfile from here in a way
  that's useful to hand back to you as `node_modules`.

## 6. Next phase
**Phase 3**: categories, collections, products, variants, images — including
the Supabase Storage bucket, and admin product CRUD so the homepage's
featured/new-arrival/bestseller sections have real data to show.

---

# Phase 3 Report

## 1. What I implemented
- Two Storage buckets created live on your project: `product-images` and
  `homepage-media`, both public-read, admin-write-only (RLS on
  `storage.objects`, same `is_admin()` check as everywhere else).
- DB triggers (applied live, not just app-level checks):
  - `product_variants` stock changes auto-sync into `inventory.available`
    and write an `audit_logs` row — enforced at the database layer, so it
    can't be bypassed by any future code path.
  - Product create/edit/delete and price changes are audit-logged
    automatically.
  - Order status changes are audit-logged automatically (ready for Phase 7).
- Admin server actions (`lib/actions/`): full CRUD for categories,
  collections, and products+variants+images, each starting with
  `requireAdmin()` — never trusts a role claimed by the client. Includes
  duplicate product, reorder categories, and per-variant stock adjustment.
- Secure image upload (`lib/actions/upload.ts`): validates file type by
  both declared MIME type AND a magic-byte sniff of the actual file
  content (so a renamed executable can't pass as a .jpg), enforces a 5MB
  limit, before it ever reaches Storage.

## 2. Files added
```
types/database.ts
lib/actions/{categories,collections,products,upload}.ts
```
Plus 2 new migrations applied directly to Supabase:
`0006_storage_buckets.sql`, `0007_inventory_sync_and_audit.sql`

## 3. Database changes
- 2 Storage buckets + 8 storage RLS policies (applied live)
- 3 trigger functions + 3 triggers on `product_variants`, `products`, `orders`
  (applied live)

## 4. Environment variables required
No new ones.

## 5. Remaining / not yet done
- **CSV bulk upload is NOT built yet.** Your spec calls for it explicitly
  with server-side validation and clear per-row errors — that's real work
  I haven't done. Flagging it now rather than skipping silently.
- **No admin UI screens yet** — everything above is the data/action layer
  admin screens will call. The actual `/admin/products` form, image
  drag-and-drop reordering UI, etc. are Phase 8 (Admin Dashboard) per your
  own phase order, though the actions are ready for it now.
- Customer-facing shop/product listing pages still don't exist — that's
  Phase 4 (search, filters, product page), so there's nowhere yet for a
  customer to actually see a product once one is added.
- AI product description generation not built (Phase 10, per your order).

## 6. Next phase
**Phase 4**: search, filters, and the full product detail page — the first
customer-facing screens that will actually use the products/variants/images
this phase just enabled.

---

# Phase 4 Report

## 1. What I implemented
- `/shop` — server-rendered product grid with real filtering (category,
  collection, price range, size, colour, in-stock-only) and sorting
  (newest, price asc/desc, best-selling, featured). Filters work via plain
  GET params, so the page functions even if a client-side hook fails.
- `/search` — searches product names (simple `ILIKE`, not ranked full-text
  search — noted as a limitation below).
- `/product/[slug]` — full product detail page: image gallery with
  thumbnail switching, colour/size variant selector with live price/stock
  update, description/fabric/care-instructions accordion, approved reviews,
  and related products from the same category.
- WhatsApp ordering is fully wired and functional — it builds a real
  `wa.me` link with product, SKU, colour, size, quantity, and total price,
  using the WhatsApp number from `site_settings`.
- Custom 404 page in brand style.

## 2. Files added
```
lib/queries/products.ts
components/product/{ProductCard,ImageGallery,VariantSelector}.tsx
components/shop/ShopFilters.tsx
app/shop/page.tsx, app/search/page.tsx, app/product/[slug]/page.tsx
app/not-found.tsx
```

## 3. Database changes
None — Phase 4 only reads existing tables.

## 4. Environment variables required
No new ones.

## 5. Remaining / not yet done — being direct about the gaps
- **Add to Bag and Buy Now are disabled ("coming soon")**, not faked. They
  need the cart (Phase 5) to mean anything real; a button that looks
  functional but doesn't actually add anything would be worse than an
  honest disabled state.
- **Search is a simple `ILIKE` match**, not ranked full-text search. Fine
  for a catalog this size; if the catalog grows large, upgrading to
  Postgres full-text search (`tsvector` + `websearch_to_tsquery`) would
  give better ranking — flagging as a possible future improvement, not
  doing it now since it's not needed yet.
- **No image zoom/fullscreen viewer yet** — thumbnail switching works,
  but the spec's "image zoom" and "fullscreen viewer" are not built.
- **No "recently viewed"** section yet.
- Other error states from your spec (out-of-stock at checkout, payment
  failed/cancelled, invalid coupon, network error) don't exist yet since
  checkout doesn't exist yet — only the 404 and empty-search/empty-shop
  states are done, because those are the only ones this phase's pages need.

## 6. Next phase
**Phase 5**: cart and wishlist — once these exist, Add to Bag/Buy Now on the
product page become real instead of disabled.

---

# Phase 5 Report

## 1. What I implemented
- **Customer auth (this wasn't done in Phase 1 as it should have been —
  built now because cart/wishlist can't work without it):** email/password
  register (`/register`) and login (`/login`) using Supabase Auth directly
  from the browser. Sign-up also creates the matching `profiles` and
  `wishlists` rows.
- **Cart**: `addToCart`, `updateCartItemQuantity`, `removeCartItem`,
  `toggleSaveForLater` server actions — all scoped to the signed-in user,
  all stock-checked before adding. `/cart` page shows active items and a
  separate "Saved for Later" section, with a running subtotal.
- **Wishlist**: `toggleWishlist`, `removeWishlistItem`,
  `moveWishlistItemToCart` server actions. `/wishlist` page. A working
  Add/Remove Wishlist button now sits on the product page.
- **Add to Bag on the product page is now real** — it calls `addToCart`,
  shows a genuine "Added to Bag" confirmation, and redirects to `/login`
  if you're not signed in, instead of failing silently.
- Cart item count now shows live in the navbar.

## 2. Files added
```
components/auth/{LoginForm,RegisterForm}.tsx
app/login/page.tsx, app/register/page.tsx
lib/actions/{cart,wishlist}.ts
components/cart/CartItemRow.tsx
app/cart/page.tsx, app/wishlist/page.tsx
components/product/WishlistButton.tsx
```
Modified: `components/product/VariantSelector.tsx` (Add to Bag is real now),
`components/Navbar.tsx` (live cart count), `app/product/[slug]/page.tsx`
(wishlist button wired in).

## 3. Database changes
None — uses tables from Phase 1.

## 4. Environment variables required
No new ones.

## 5. Remaining / not yet done — being direct about the gaps
- **Google login not built** — your spec asks for it explicitly. Email/
  password only for now. Google OAuth needs a Google Cloud console setup
  on your end (client ID/secret) before I can wire it in — tell me when
  you're ready to do that and I'll walk you through it.
- **Forgot password / reset password not built.**
- **Buy Now is still disabled** — it needs checkout (Phase 6) to mean
  anything; not faked.
- **"Proceed to Checkout" is disabled** on the cart page for the same
  reason.
- Order confirmation emails, account order history — later phases.

## 6. Next phase
**Phase 6**: checkout — customer details form, Razorpay integration, and
COD. This is where Buy Now and Proceed to Checkout stop being disabled.

---

# Phase 6 Report — Checkout

## 1. What I implemented
- **Admin-togglable checkout mode**, as you asked: `site_settings.checkout_mode`
  holds `{"mode": "whatsapp"}` or `{"mode": "razorpay"}`. `setCheckoutMode()`
  admin action flips it — no code change or redeploy needed, checkout page
  reads it live on every request. Currently set to `whatsapp`.
- **The atomic order-creation function** (`create_order_from_cart`, run as a
  single Postgres transaction): locks the exact stock rows being ordered,
  validates every item still has enough stock, computes subtotal/shipping/
  COD-fee entirely from the database's own current prices and settings
  (never from anything the client sends), writes the order + order_items,
  decrements stock, and clears the cart — all atomically. This is what
  actually satisfies your "never trust price from browser" / "prevent
  overselling" requirements, not just app-level checks.
- **WhatsApp checkout**: fully working end-to-end. Places a real order,
  then opens a WhatsApp message with the order number and total for the
  customer to send.
- **COD checkout**: fully working, respects your `site_settings.cod`
  toggle/min/max/fee.
- **Razorpay checkout**: built for real — order creation, Razorpay order
  via their SDK, checkout.js modal, and server-side HMAC signature
  verification (`app/api/razorpay/verify`) before ever marking an order
  paid. **I have not been able to test this**, since it needs your real
  `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` — per your own instruction not
  to fake a payment success, I'm not claiming this works until it's been
  tested against your actual Razorpay account.
- `/checkout` page (order summary + form), `/order-confirmation/[orderNumber]`.
- "Proceed to Checkout" on the cart page is now a real link, not disabled.

## 2. Files added
```
lib/actions/{checkout,checkout-schema,admin-settings,razorpay}.ts
components/checkout/{CheckoutForm,RazorpayButton}.tsx
app/checkout/page.tsx, app/order-confirmation/[orderNumber]/page.tsx
app/api/razorpay/verify/route.ts
```
Plus 2 new migrations: `0008_checkout_mode_settings.sql`,
`0009_create_order_function.sql`.

## 3. Database changes — ⚠️ NOT YET APPLIED
The Supabase connector dropped mid-session and hasn't reconnected as of
this message. **Migrations 0008 and 0009 are written but not yet run
against your live project.** Checkout will fail until they are. Options:
1. Tell me to retry — I'll attempt to reconnect and apply them automatically.
2. Paste `supabase/migrations/0008_checkout_mode_settings.sql` then
   `supabase/migrations/0009_create_order_function.sql` into the Supabase
   SQL Editor yourself, in that order.

## 4. Environment variables required
`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` — only needed if/when you
switch `checkout_mode` to `"razorpay"`. Not required for WhatsApp/COD.

## 5. Remaining / not yet done — being direct about the gaps
- **Razorpay flow is untested** (explained above) — the code is real, not
  a stub, but "built" and "verified working" are different claims and I'm
  only making the first one.
- **Stock is reserved at order creation, even for Razorpay**, before
  payment is confirmed. If a customer abandons the Razorpay payment
  screen, that stock stays reserved against a `pending` order — there's
  no expiry/cleanup job to release it yet. Worth building before this
  goes live with Razorpay as the active mode.
- **Coupons are not applied at checkout yet** — `discount` is hardcoded
  to 0 in the order function. Coupon logic is its own phase (Phase 9 in
  your original order) and I haven't pulled it forward.
- No order-confirmation email/SMS — customer sees the confirmation page
  and (for WhatsApp mode) a WhatsApp message, nothing else yet.
- Buy Now (single-item fast checkout, bypassing the cart) is still not
  built — only "add to cart → checkout" works.

## 6. Next phase
**Phase 7**: order management — status tracking (the 11-stage flow from
your spec), inventory tie-ins beyond what Phase 3 already does, shipments,
and returns.

---

# Phase 7 Report — Order Management, Shipping, Returns

## 1. What I implemented
- Admin actions (`lib/actions/admin-orders.ts`): `updateOrderStatus` (any of
  the 11 statuses from your spec), `addShipment` (records carrier/tracking,
  auto-sets status to `shipped`), `markDelivered`, `approveReturn`,
  `markReturnRefunded`, `rejectReturn` — every one role-gated.
- Customer return requests (`lib/actions/returns.ts`): only allowed on the
  customer's own **delivered** orders, checked server-side (not just via
  RLS) before inserting.
- `/account` — simple hub linking to Orders, Wishlist, Bag, plus a working
  logout button.
- `/account/orders` — order list with a visual status timeline for each.
- `/account/orders/[orderNumber]` — full detail: line items, shipment
  tracking info (carrier, tracking number, link) once shipped, and a
  "Request Return" action per item once delivered.
- Order status changes are already audit-logged automatically (from the
  Phase 3 trigger) — no extra work needed there.

## 2. Files added
```
lib/actions/{admin-orders,returns}.ts
components/account/{OrderStatusTimeline,ReturnRequestForm}.tsx
components/auth/LogoutButton.tsx
app/account/page.tsx, app/account/orders/page.tsx,
app/account/orders/[orderNumber]/page.tsx
```

## 3. Database changes
None — uses the `orders`/`shipments`/`returns` tables and the `order_status`
enum from Phase 1, and the audit trigger from Phase 3.

## 4. Environment variables required
No new ones.

## 5. Remaining / not yet done
- **No admin screens to actually call these actions from** — same pattern
  as Phase 3: the actions exist and are ready, but there's no `/admin/orders`
  UI yet to click "mark shipped" or "approve return" from. That's Phase 8.
  Until then, status changes would need to be triggered via a temporary
  script or directly in the Supabase table editor.
- No email/SMS notification when status changes — customer has to check
  `/account/orders` to see updates.
- Refunds are recorded as a status change only — no actual Razorpay refund
  API call is made. If Razorpay becomes the active payment method, a real
  refund needs to hit their refunds API, not just flip a status in our DB.

## 6. Next phase
**Phase 8**: the admin dashboard itself — this is where every action built
across Phases 3, 6, and 7 finally gets a UI to be triggered from.

---

# Phase 8 Report — Admin Dashboard

## 1. What I implemented
- **Admin auth gate done properly**: `/admin/login` (checks `admin_users`
  after sign-in, not just a valid Supabase session), plus a server-side
  layout guard on every `/admin/*` page — not just the edge middleware
  from Phase 1, an actual per-request role check.
- **Dashboard** (`/admin`): real metrics — today's sales, total paid sales,
  total/pending orders, product count, customer count, low stock, out of
  stock — all queried live, plus a recent-orders table.
- **Orders** (`/admin/orders`, `/admin/orders/[orderNumber]`): full list,
  detail view with customer/address, a working status updater (all 11
  statuses), a shipment form (carrier + tracking, auto-sets status to
  Shipped), and return approve/reject/refund controls — every action from
  Phase 7 now has a real button.
- **Products** (`/admin/products`, `/new`, `/[id]/edit`): list with
  edit/delete, a create form with dynamic variant rows (colour/size/SKU/
  price/stock), an edit form for the product's own fields, and an image
  manager (upload with the Phase 3 magic-byte validation, delete, primary
  badge).
- **Categories** and **Collections** (`/admin/categories`,
  `/admin/collections`): list + add + delete.
- **Homepage CMS** (`/admin/homepage`): edit announcement bar text/visibility
  and hero heading/description/image URL — live on the homepage immediately.
- **Settings** (`/admin/settings`): the checkout-mode toggle you asked for
  (WhatsApp ⇄ Razorpay), WhatsApp number, and COD enable/min/max/fee — all
  writing to the same `site_settings` table every other phase already reads.

## 2. Files added
```
app/admin/login/page.tsx
app/admin/(dashboard)/layout.tsx
app/admin/(dashboard)/page.tsx
app/admin/(dashboard)/orders/{page,[orderNumber]/page}.tsx
app/admin/(dashboard)/products/{page,new/page,[id]/edit/page}.tsx
app/admin/(dashboard)/categories/page.tsx
app/admin/(dashboard)/collections/page.tsx
app/admin/(dashboard)/homepage/page.tsx
app/admin/(dashboard)/settings/page.tsx
components/admin/{AdminSidebar,StatusUpdater,ShipmentForm,ReturnActions,
  DeleteProductButton,ProductForm,ProductImageManager,CategoryManager,
  CollectionManager,HomepageEditor,SettingsForm}.tsx
lib/actions/homepage.ts
```
Note: pages live under a `(dashboard)` route group so `/admin/login` isn't
wrapped by the auth-guard layout (that would have caused a redirect loop).

## 3. Database changes
None — this phase is entirely UI + actions on top of the existing schema.

## 4. Environment variables required
No new ones.

## 5. Remaining / not yet done — being direct about the gaps
Your spec's admin sidebar lists more than what's built. Specifically NOT
done yet:
- **Customers** screen (view customer list/details) — not built.
- **Inventory** screen (dedicated stock view beyond what's on each
  product's edit page) — not built.
- **Coupons** admin UI — the `coupons`/`coupon_usage` tables exist
  (Phase 1) but there's no screen to create/manage them, and checkout
  doesn't apply them yet either.
- **Reviews** moderation screen — reviews can be submitted (Phase 4 RLS
  allows verified purchasers) but there's no admin approve/reject UI.
- **Banners** management — table exists, no admin screen.
- **Analytics** charts (revenue/orders/top products/top categories/customer
  growth) — only the plain-number stat cards on the dashboard are built,
  no charts.
- **Admin Users** management screen (invite/edit other admins' roles) —
  not built; I promoted your account directly via SQL in Phase 1.
- **Audit Logs** viewer — logs are being written automatically (Phase 3
  triggers) but there's no screen to read them; you'd need to query the
  `audit_logs` table directly in Supabase.
- **Backup/Export** — not built.
- **CSV bulk upload** — still not built (also flagged back in Phase 3).
- Product edit page can't add/edit/reorder variants or images' alt-text/
  order after creation — only images (upload/delete) and the product's own
  fields are editable; variant management after creation needs Supabase's
  table editor for now.
- No AI product description generator (Phase 10 in your original order).

This is the largest set of deferred items so far — Phase 8 in your original
spec is genuinely the biggest phase, and I've prioritized making every
already-built backend action (products, orders, checkout settings) usable
from a real screen over covering every sidebar item shallowly.

## 6. Next phase
Per your original order: **Phase 9** — remaining Homepage CMS coverage,
Coupons, and Reviews moderation. Or, if higher priority for you: Customers
screen, Analytics charts, or CSV bulk upload. Your call.

---

# Phase 9 Report — Coupons, Reviews, Banners, Homepage CMS completion

## 1. What I implemented
- **Coupons, applied server-side**: extended `create_order_from_cart` to
  accept an optional coupon code and validate it entirely inside the same
  atomic transaction — active/date range/min order/first-order-only/usage
  limit/customer-specific checks, discount computed from the coupon's own
  rules (percentage or flat, capped by max discount), never from anything
  the client sends. `/admin/coupons` to create/toggle/delete. Checkout form
  now has a coupon code field, and the discount shows on the order
  confirmation page.
- **Reviews moderation**: `/admin/reviews` lists unapproved reviews with
  Approve/Reject.
- **Banners**: `/admin/banners` — upload (same magic-byte validated
  uploader as products, new `homepage-media` bucket), toggle active,
  delete.
- **Homepage CMS completed**: "Why Hana" cards and newsletter heading/
  subheading are now editable, alongside the announcement bar and hero
  from Phase 8.

## 2. Files added
```
lib/actions/{coupons,review-moderation,banners}.ts
components/admin/{CouponManager,ReviewModerationList,BannerManager}.tsx
app/admin/(dashboard)/{coupons,reviews,banners}/page.tsx
```
Modified: `components/checkout/{CheckoutForm,RazorpayButton}.tsx`,
`lib/actions/{checkout,razorpay,upload}.ts`,
`components/admin/HomepageEditor.tsx`,
`app/order-confirmation/[orderNumber]/page.tsx`.
Plus 1 new migration: `0010_coupon_support.sql`.

## 3. Database changes — ⚠️ NOT YET APPLIED
Same issue as before: the Supabase connector dropped again and hasn't
reconnected. `0010_coupon_support.sql` is written but not run against your
live project yet. **Coupons will not work at checkout until it's applied**
— paste it into the SQL Editor, same as the last one.

## 4. Environment variables required
No new ones.

## 5. Remaining / not yet done
- **Product-specific and category-specific coupon restrictions** aren't
  exposed in the admin form (the DB columns exist, just no UI for them).
- **Banners don't render anywhere yet** — they're fully manageable in
  admin, but no customer-facing page has a banner slot wired in.
- Customers screen, dedicated Inventory screen, Admin Users management,
  Audit Log viewer, Backup/Export, CSV bulk upload, Analytics charts —
  still not built (carried over from Phase 8's gap list).
- Reviews are rejected by hard delete, not a "rejected" status — there's
  no record kept of rejected reviews.

## 6. Next phase
Remaining from your original order: **Phase 10** (WhatsApp — already
functional since Phase 6 — and AI product descriptions, not built), or
**Phase 11** (SEO, security hardening, performance, accessibility). Or
tell me which specific gap from the list above matters most to you.

---

# Phase 11 Report (partial) — SEO

Jumped ahead of Phase 10 since SEO needed no new API keys and adds
immediate value; Phase 10 (AI descriptions) is still pending — see below.

## 1. What I implemented
- **Dynamic metadata** per product page (`generateMetadata`), using the
  product's own `seo_title`/`seo_description` when set, falling back
  sensibly otherwise. Shop page metadata varies by category/collection/
  search filter.
- **Canonical URLs** and **Open Graph tags** on product pages and site-wide
  defaults in the root layout.
- **Product structured data (JSON-LD)**: name, image, price, availability
  (in/out of stock computed from real variant stock), and aggregate rating
  when reviews exist.
- **Breadcrumb structured data** on product pages.
- **Dynamic sitemap.xml** (`app/sitemap.ts`) — every published product,
  category, and collection, generated live from the database, not a
  static file that goes stale.
- **robots.txt** (`app/robots.ts`) — disallows `/admin`, `/account`,
  `/cart`, `/checkout`, `/api` from indexing, points to the sitemap.

## 2. Files added
```
app/sitemap.ts, app/robots.ts
```
Modified: `app/product/[slug]/page.tsx` (metadata + JSON-LD),
`app/shop/page.tsx` (metadata), `app/layout.tsx` (site-wide OG defaults).

## ⚠️ Important — placeholder domain
Every URL above uses `https://hanaburka.com` as a placeholder — **you
don't have a live domain connected yet as far as I know.** Once you do,
search-and-replace `SITE_URL` in `app/sitemap.ts`, `app/robots.ts`, and
`app/product/[slug]/page.tsx`, and `metadataBase` in `app/layout.tsx`, or
tell me the real domain and I'll do it.

## 3. Database changes
None.

## 4. Environment variables required
No new ones.

## 5. Remaining / not yet done
- Category and collection pages don't have their own dedicated routes
  with metadata yet — they're just `/shop?category=...` query params
  right now, which is weaker for SEO than a clean `/category/burkas`
  path. Worth revisiting.
- No structured data on the homepage or shop listing page (only product
  pages).
- Phase 10 (AI product description generation via OpenAI) is still not
  built — needs `OPENAI_API_KEY` from you first.
- Accessibility and performance passes (the rest of Phase 11) haven't
  been done yet — this covers SEO only so far.

## 6. Next
Phase 11 continued (accessibility/performance/security hardening pass),
or Phase 10 (AI descriptions) if you want to provide an OpenAI key, or a
real domain so the placeholder URLs above can be fixed.

---

# Phase 11 Report (continued) — Security, Accessibility, Performance

## 1. What I implemented
- **Security headers** (`next.config.js`): X-Frame-Options (clickjacking
  protection), X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
  Deliberately did NOT add a Content-Security-Policy — Razorpay's
  checkout.js needs specific CSP allowances I haven't worked out and
  tested, and a broken CSP would silently break payment. Left out rather
  than shipped untested, per your "don't fake it" instruction.
- **Image optimization**: product cards and the hero image now use
  `next/image` instead of raw `<img>` tags — real lazy loading, responsive
  sizing, and automatic format optimization (the hero image is
  `priority`-loaded since it's the page's LCP element).
- **Accessibility**: skip-to-content link (site-wide), `aria-label`s added
  to every checkout form field (they were placeholder-only before, which
  screen readers don't announce properly), `id="main-content"` landmark
  added to the homepage.

## 2. Files added
None — all edits to existing files.
Modified: `next.config.js`, `app/layout.tsx`, `app/page.tsx`,
`components/product/ProductCard.tsx`, `components/Hero.tsx`,
`components/checkout/CheckoutForm.tsx`.

## 3. Database changes
None.

## 4. Environment variables required
No new ones.

## 5. Remaining / not yet done — being direct
This was a partial pass, not a full audit:
- **Skip-to-content only wired on the homepage** — shop, product, cart,
  checkout, and account pages don't have the `id="main-content"` target
  yet.
- **Only the checkout form's inputs got proper `aria-label`s** — login,
  register, admin forms, and the rest of the site still rely on
  placeholder text alone in several places.
- **Only ProductCard and Hero images use `next/image`** — the image
  gallery on the product page, category grid, admin image previews, and
  banner previews still use raw `<img>` tags.
- **No rate limiting** on login/register/checkout endpoints — someone
  could hammer these with repeated requests. Real rate limiting needs a
  store (Redis/Upstash or similar) that isn't set up.
- **No automated accessibility testing** (axe, Lighthouse CI) — this was
  a manual, partial pass, not a verified audit. I'd genuinely recommend
  running Lighthouse yourself once this is deployed rather than trusting
  my pass as complete.
- **CSP is still missing** (explained above).

## 6. Where things stand overall
At this point, the core shopping flow (browse → cart → checkout via
WhatsApp/COD → order tracking) and the admin dashboard are functionally
complete and usable, with Razorpay built but untested. The remaining gaps
are consistently the same handful of items across every phase's report:
Customers screen, CSV bulk upload, AI descriptions, full accessibility/
performance audit, and a live domain to replace the SEO placeholder URLs.
Worth deciding which of those (if any) matters before going further, versus
actually testing what's built.

---

# Customers Screen Report

## 1. What I implemented
- `/admin/customers` — list of signed-up customers with name, email,
  phone, order count, total spent, and join date.
- `/admin/customers/[id]` — profile info, saved addresses, and full order
  history with links into each order's admin detail page.

## 2. Files added
```
app/admin/(dashboard)/customers/{page,[id]/page}.tsx
```
Modified: `components/admin/AdminSidebar.tsx` (added Customers link).

## 3. Database changes
None — reads Supabase Auth (via the Admin API) plus existing `profiles`,
`addresses`, `orders` tables.

## 4. Environment variables required
No new ones.

## 5. Remaining / not yet done
- **Only the first 50 signed-up customers show** — `listUsers()` is
  paginated and this screen doesn't page through it yet. Fine for now,
  will need pagination before the store has real volume.
- No search/filter on the customer list.
- No way to email/message a customer from this screen, or see their
  wishlist/cart contents (only orders and addresses).
- "Total Spent" counts `pending` and `paid` orders together — it doesn't
  distinguish confirmed revenue from orders still awaiting payment/COD
  delivery. Worth tightening once Razorpay is live and payment status is
  more meaningful.

---

# Homepage Enrichment + Missing Pages Report

Prompted by your feedback that the homepage felt too simple and several
nav/footer links were 404ing.

## 1. What I implemented
- **Homepage now has real product rails**: Featured, New Arrivals, Best
  Sellers — each pulls live products marked accordingly in admin, and
  each section hides itself automatically when there's nothing to show
  (no placeholder/fake products).
- **Banners now actually render** — `BannerStrip` shows active homepage
  banners from `/admin/banners`, closing the gap flagged back in Phase 9.
- **Built the previously-404ing pages**: `/about`, `/contact` (WhatsApp
  link, pulled from your settings), `/shipping-policy`, `/return-policy`,
  `/privacy-policy`, `/terms`, `/collections` (grid of all published
  collections), `/new-arrivals` (real products marked as new arrivals).

## 2. Files added
```
components/{ProductRail,BannerStrip}.tsx
app/about/page.tsx, app/contact/page.tsx
app/{shipping-policy,return-policy,privacy-policy,terms}/page.tsx
app/collections/page.tsx, app/new-arrivals/page.tsx
```
Modified: `app/page.tsx` (rewritten with the new sections).

## 3. Database changes
None.

## 4. Environment variables required
No new ones.

## 5. Remaining / not yet done — being direct
- **About/Contact/policy pages are placeholder copy**, clearly marked as
  such on each page. They read fine but are NOT your actual brand story,
  return window, or legal terms — replace before going live. The privacy
  policy and terms in particular should get real legal review, not just
  my draft text.
- **Contact page has no working contact form**, only a WhatsApp link —
  an email-based contact form isn't built.
- The homepage will still look sparse until you add real products marked
  as featured/new arrival/bestseller in admin — that's expected, not a
  bug; the sections are designed to disappear rather than show fake data.

---

# Password Reset Flow (closing a Phase 5 gap)

Built while debugging the admin login — this was flagged as missing back
in Phase 5 ("Forgot password / reset password not built") and turned out
to be needed immediately.

## What I implemented
- `app/auth/callback/route.ts` — exchanges a Supabase recovery/magic-link
  code for a session, then redirects to `/update-password`.
- `app/update-password/page.tsx` — lets the now-authenticated user set a
  new password via `supabase.auth.updateUser()`.

## Required setup (one-time, in Supabase dashboard)
Authentication → URL Configuration:
- Site URL: `http://localhost:3000/auth/callback` (update to your real
  domain's `/auth/callback` once deployed)
- Redirect URLs: add `http://localhost:3000/**`

## Remaining
- This only covers the "forgot password" flow via Supabase's built-in
  email templates (still their default styling/wording, not customized).
- No "change password while logged in" link exists yet inside `/account`
  — `/update-password` works for that too if visited directly, but isn't
  linked from anywhere yet.

---

# Motion & Premium UX Pass

You asked for richer, premium motion. I kept one design principle in mind
while building this: real premium sites spend their "motion budget"
deliberately — one signature moment, plus fast interactions that respond
to what you do — rather than fading every element on scroll, which
actually reads as generic/templated rather than premium. Here's what
landed:

## 1. What I implemented
- **The signature moment**: the hero headline now reveals word-by-word,
  the hero image wipes in with a clip-path reveal, then the description
  and buttons settle in — one orchestrated sequence, not scattered effects.
- **Sticky, blurred navbar** — stays pinned with a frosted-glass backdrop
  as you scroll, with an animated underline on nav-link hover.
- **Product card hover**: image scales in slowly (700ms, not a snappy
  105% — premium sites use slower, more expensive-feeling easing), a soft
  lifted shadow appears, and a "VIEW PRODUCT" label slides up from the
  bottom edge.
- **Product image gallery**: crossfades between images instead of an
  instant swap, and a real hover-zoom (magnifying-glass style, following
  your cursor) on the main image — this closes a gap flagged back in
  Phase 4 ("no image zoom yet").
- **Page transitions**: every route change fades in smoothly (`app/
  template.tsx`), site-wide.
- **Section reveals used once per section, not per element** — homepage
  sections (categories, product rails, banners, "Why Hana", newsletter)
  each animate in as a single block when scrolled into view, rather than
  every card/line animating independently.
- **Button micro-interactions**: scale up slightly on hover, scale down
  on click/tap — answers the action instead of animating ambiently.
- **Loading skeletons** for the shop and product pages — real perceived-
  speed polish while data loads, matching your brand's ivory/mocha tones
  instead of a generic spinner.
- **Fixed a real bug while in here**: category tiles on the homepage
  linked to `/category/[slug]`, a route that was never built — they now
  correctly link to `/shop?category=...`.
- **Respects reduced motion** — every animation checks
  `prefers-reduced-motion` and falls back to an instant, static state.

## 2. Files added
```
components/motion/Reveal.tsx
components/HeroMotion.tsx
app/template.tsx
app/shop/loading.tsx, app/product/[slug]/loading.tsx
```
Modified: `components/Hero.tsx`, `components/Navbar.tsx`,
`components/CategoryGrid.tsx`, `components/ProductRail.tsx`,
`components/WhyHana.tsx`, `components/Newsletter.tsx`,
`components/BannerStrip.tsx`, `components/product/{ProductCard,
ImageGallery}.tsx`. Added `framer-motion` to `package.json` — run
`npm install` again after pulling this update.

## 3. Database changes
None.

## 4. Remaining / not yet done
- Cart/wishlist icon badges don't have a "bump" animation when the count
  changes — would need converting the navbar's cart count into a small
  client-side component to detect the change; not done.
- No fullscreen/lightbox image viewer on the product page — the hover-zoom
  is new, but a true fullscreen mode (tap to expand) isn't built.
- Mobile-specific motion (e.g., swipeable image gallery) not addressed —
  this pass focused on desktop interaction patterns; touch gestures for
  the gallery are a reasonable follow-up.
- Admin dashboard has none of this motion applied — it's intentionally
  plain/functional, which is appropriate for an internal tool, but
  flagging in case you expected otherwise.

---

# Cinematic Homepage + Admin Self-Sufficiency Pass

## 1. What I implemented — Admin (so nothing needs code/Supabase access)
- **Variant management is now fully in the UI**: add, edit (colour/size/
  SKU/price/stock inline), and delete variants directly from a product's
  edit page. This closes the biggest remaining "needs Supabase" gap.
- **Hero image now uploads directly** from Admin → Homepage — no more
  uploading via Products then copy-pasting a URL. Shows a live preview.
- Combined with what already existed (product creation, image upload,
  categories, collections, coupons, banners, settings), admin can now run
  day-to-day catalog and homepage operations entirely from the dashboard.

## 2. What I implemented — Cinematic homepage motion
Went through your list item by item:
- **Cinematic hero reveal** — word-by-word headline, clip-path image wipe.
- **Slow image zoom** — hero image scales from 115% to 105% over 1.4s as
  it reveals (a slow "breathing" zoom, not a snap).
- **Parallax scrolling** — the hero image drifts at a different speed than
  the page as you scroll past it.
- **Blur-to-sharp image reveal** — the hero image starts blurred and
  sharpens in over ~1 second.
- **Staggered product cards** — product rails now reveal card-by-card
  (80ms apart) when scrolled into view, rather than as one block.
- **Smooth page transitions** — already in place from the last pass.
- **Image hover swap** — product cards now crossfade to a second product
  photo on hover, when one exists (this was in your original spec and
  hadn't been built until now).
- **Magnetic CTA** — the hero's two buttons pull gently toward your cursor
  within their hover radius, spring back when you leave.
- **Text masking/reveal** — section headings (Shop by Category, each
  product rail title) slide up from behind a clipped mask as they scroll
  into view.
- **Scroll-triggered animations** — all of the above trigger on scroll
  position via `whileInView`, not on page load.

## 3. Files added
```
components/motion/{MagneticButton,StaggerGroup,TextReveal}.tsx
components/admin/VariantManager.tsx
```
Modified: `components/HeroMotion.tsx`, `components/ProductRail.tsx`,
`components/CategoryGrid.tsx`, `components/product/ProductCard.tsx`,
`components/admin/HomepageEditor.tsx`,
`app/admin/(dashboard)/products/[id]/edit/page.tsx`,
`lib/actions/products.ts` (variant CRUD actions added).

## 4. Database changes
None.

## 5. Remaining / not yet done
- Text-mask reveal is only applied to a few section headings, not every
  heading site-wide (shop page, product page, footer, etc.) — deliberately
  limited rather than applying it everywhere, to avoid every piece of text
  on the site animating, which stops feeling premium and starts feeling
  busy.
- Magnetic effect is only on the two hero buttons — not every button site-
  wide, same reasoning.
- Parallax is only on the hero image — could extend to category tiles or
  banners, not done yet.
- Product listing pages (/shop, /new-arrivals) still use the plain
  `ProductCard` grid without `StaggerGroup` — only homepage rails got the
  staggered treatment so far. Can extend if you want it there too.

---

# Fix: Auto-generate product slug

Product creation required manually typing a slug (unlike Categories/
Collections, which auto-fill it) — a real oversight, now fixed.

## What changed
`components/admin/ProductForm.tsx`: the slug field now auto-fills from
the product name as you type, exactly like Categories/Collections already
did. You can still edit it manually — once you do, it stops auto-updating
from the name (so you don't lose a manual edit). In edit mode, an
existing product's slug is left alone by default (changing it would break
any existing links to that product's page).

---

# Branding Update + Motion Brief (Part 1 of 2)

You sent a detailed 24-point motion brief plus real business details. Given
the size of the brief, I split this into two passes — here's Part 1.

## 1. What I implemented — Branding/business info
- **Address, both phone numbers, WhatsApp, Instagram** added to Footer and
  Contact page, all pulling from one new centralized file (`lib/config.ts`)
  instead of being duplicated across components, per your instruction.
- **WhatsApp number is still admin-editable** (Settings → WhatsApp Number) —
  I did NOT replace that with a hardcoded env var, since removing your
  ability to change it without a redeploy would be a real regression, not
  an improvement. The env var / hardcoded value is now just the *fallback*
  if the admin field is ever left empty.
- **Instagram** is centralized via `NEXT_PUBLIC_INSTAGRAM_URL`, defaulting
  to `instagram.com/hanaburka` if the env var isn't set.
- Footer now has WhatsApp + Instagram icon buttons with the hover
  animation you specified (lift + soft circular glow).
- Warmed the background tone slightly toward the parchment/cream shade in
  your reference screenshot.

## ⚠️ Logo — could not use the file you sent
Your logo file is a **JPEG**, which can't store transparency. I checked
the actual pixel values: the background is pure black and the artwork
itself is only barely darker than that — there's no clean line between
"logo" and "background" for me to cut out. Using it as-is would show a
black rectangle, not a clean mark. **Please send the original PNG or SVG
version** (exported with a transparent background) and I'll drop it into
the navbar and footer immediately.

## 2. What I implemented — Motion brief (marquee + navbar)
- **Announcement bar is now a real seamless infinite marquee** — messages
  scroll right-to-left continuously with no visible loop jump, pauses on
  hover, respects reduced motion. Admin can now add multiple rotating
  messages (Homepage → Announcement Bar) instead of just one.
- **Navbar now transitions on scroll**: transparent at the top of the
  page, smoothly becomes frosted glass with a soft shadow as you scroll,
  logo scales down slightly, and the current page gets a persistent
  underline indicator (not just on hover).

## 3. Files added/changed
```
lib/config.ts (new)
components/motion/Marquee.tsx (new)
components/NavbarClient.tsx (new)
```
Modified: `components/{AnnouncementBar,Navbar,Footer,admin/HomepageEditor}.tsx`,
`app/contact/page.tsx`, `tailwind.config.ts`, `.env.example`.

## 4. Still to come — Part 2 (your brief's remaining items)
Not yet built: product card lift + arrow micro-interaction, category card
hover motion (title shift, arrow reveal), banner parallax + delayed text
reveal, wishlist heart icon with pulse animation, proper enter/exit page
transition (current one only fades in, doesn't yet do the exit
scale-down), subtle "breathing" ambient motion, shimmer-style skeleton
loaders, and explicit mobile motion reduction (disabling magnetic/parallax
on touch devices). Continuing with these next unless you'd rather review
what's here first.

---

# Motion Brief Part 2 — remaining items

## 1. What I implemented
- **Structural fix**: moved all customer-facing pages into an `app/(shop)/`
  route group, separate from admin. Route group folders don't change URLs
  (`/shop` is still `/shop`) — this just lets page transitions apply ONLY
  to customer pages, matching your brief's explicit "admin should
  prioritize speed" instruction. Previously the fade transition was
  (incorrectly) applying to admin too.
- **Real enter/exit page transitions**: old page fades + scales down
  slightly, new page fades + scales up into place — ~280ms each way,
  using `AnimatePresence`. Scoped to `(shop)` only.
- **Product cards**: now lift 6px on hover (in addition to the existing
  shadow/zoom/image-swap), and the "VIEW PRODUCT" label has an arrow that
  slides right.
- **Category cards**: image zooms on hover, a subtle dark overlay appears,
  the title shifts right slightly, and an arrow fades/slides in next to it.
- **Banners**: real scroll parallax (image moves opposite the page
  direction), slow scale-in the first time they enter view, and the title
  label reveals ~0.5s after the image, not simultaneously.
- **Wishlist heart**: real heart icon (was text-only before) with a
  spring/pulse animation on toggle, fills solid when active.
- **"Breathing" motion**: hero image has an almost-imperceptible 7-second
  vertical drift that starts once the entrance animation settles.
- **Shimmer skeletons**: loading states now sweep a soft gold-tinted
  shimmer across ivory/mocha tones instead of a flat pulse.
- **Mobile motion reduction**: added a touch-device detector
  (`useIsTouchDevice`) and wired it into the magnetic buttons (fully
  disabled on touch), the product-gallery hover-zoom (disabled on touch,
  since there's no cursor to follow), and both parallax effects (hero,
  banners) — reduced to zero movement on touch devices rather than
  running expensive scroll-linked transforms where they'd add no value.

## 2. Files added
```
app/(shop)/layout.tsx
components/motion/{PageTransition,useIsTouchDevice}.tsx
components/BannerStripClient.tsx
```
Modified: `components/{HeroMotion,BannerStrip,CategoryGrid,
product/{ProductCard,ImageGallery,WishlistButton},motion/MagneticButton}.tsx`,
`app/globals.css` (shimmer keyframes), both `loading.tsx` files.
Restructured: every customer route moved under `app/(shop)/` (URLs
unchanged), `app/template.tsx` removed (superseded by the route-group
layout + PageTransition).

## 3. What I genuinely cannot verify myself
Your brief's Section 23 asks to check every route on desktop/mobile/tablet,
console errors, and a full build. I don't have a browser to click through
this with — I've read through the code carefully and it's internally
consistent, but **please run `npm run build` locally** (not just `npm run
dev`) before considering this done — a production build catches type
errors and issues that dev mode sometimes doesn't. If it fails, send me
the exact error output and I'll fix it directly.

## 4. Remaining from your original brief
- No custom active-page indicator styling beyond the underline already
  added to Navbar in Part 1.
- Cart/checkout motion intensity wasn't explicitly reduced to match your
  "★★★/★★" hierarchy — they already had minimal motion by default since
  I never added heavy effects there, but I haven't done a pass to verify
  they specifically match your 1-5 star scale per page.
- Add-to-cart cart-icon reaction (a small bump on the cart badge when an
  item is added) still isn't built — flagged as remaining since Phase 5.

---

# Category/Collection Image Upload + Hero Polish

## 1. What I implemented
- **This was a real gap, now fixed**: Categories and Collections had no
  way to upload an image from admin — only the name could be set. Every
  category on your homepage showed "No image" because there was literally
  no button to add one. `/admin/categories` and `/admin/collections` now
  have a direct upload control next to each row — pick a file, it uploads
  and attaches immediately, no separate step.
- **Hero scroll-cue**: a subtle "SCROLL" indicator with a pulsing line
  fades in at the bottom of the hero after the entrance settles — a
  common premium-site pattern that hints there's more below the fold.
- **Elevated the "No image" placeholder** on category tiles — was plain
  gray text, now a soft icon + "Image coming soon" label, more in keeping
  with an editorial-luxury feel while images are still being added.

## 2. Files added
None — all edits to existing files.
Modified: `lib/actions/upload.ts` (2 new upload functions),
`components/admin/{CategoryManager,CollectionManager}.tsx` (rebuilt with
image upload), `app/admin/(dashboard)/{categories,collections}/page.tsx`
(fetch image_url), `components/HeroMotion.tsx`, `components/CategoryGrid.tsx`.

## 3. What to do next
Go to `/admin/categories` and upload a real photo for each of Burkas/
Abayas/Hijabs/Inner Caps/Accessories — the homepage category grid will
pick them up immediately, no code changes needed. Same for Collections.

---

# Logo, Background Color, Hero Slideshow, Search, Business Info

## 1. What I implemented
- **Real logo integrated**: this file had actual transparency (verified
  the alpha channel before using it) — now shows in the navbar and footer
  next to the wordmark.
- **Background color changed site-wide** to `#FDE5A5` (sampled directly
  from your reference swatch) — this replaces the ivory tone everywhere,
  since every "ivory" surface across the site references one shared color
  token.
- **Hero is now an auto-sliding carousel**: upload multiple images in
  Admin → Homepage and it rotates every 5 seconds with a crossfade, plus
  clickable dot indicators. Upload just one image and it behaves exactly
  as before (static). All the existing entrance motion — blur reveal,
  slow zoom, parallax, breathing drift — still applies on top.
- **Search page now shows the full catalog by default**, narrowing as you
  type, instead of an empty page asking you to search first.
- **Business info (name/address/phone numbers) is now admin-editable** —
  Settings → Business Info. Previously this was hardcoded in the codebase;
  now it's stored in the database with the details you gave as the
  fallback, same pattern as the WhatsApp number.
- A few more hover touches: navbar action icons (Search/Account/Wishlist/
  Cart) now scale slightly on hover, matching the rest of the site's
  interaction language.

## 2. Files added
```
public/logo.png
```
Modified: `tailwind.config.ts` (background color), `components/{NavbarClient,
Footer,HeroMotion,CategoryGrid}.tsx`, `components/admin/{HomepageEditor,
SettingsForm}.tsx`, `lib/{config,actions/admin-settings}.ts`,
`app/(shop)/{search,contact}/page.tsx`, `app/admin/(dashboard)/settings/page.tsx`.

## 3. Database changes
None directly — `business_info` is a new `site_settings` key, but it's
created automatically the first time you save the Business Info form in
Settings (no migration needed).

## 4. What "customer care...cancelled" needs from you
I wasn't fully sure what you meant by "customer care where cancelled" —
I found no broken/cancelled links in the footer's Customer Care column
(Contact, Shipping, Returns, Terms, Privacy all work). If you meant
something specific was showing incorrectly, tell me exactly what you saw
and I'll fix that specifically rather than guess further.

## 5. Remaining
- Only the hero image is a slideshow — banners and other single-image
  sections are still static.
- Business info form doesn't yet validate phone number format.

---

# Customer Care Editing + Buy Now Toggle

## 1. Answered your questions
- **Multiple images/products on the homepage**: yes, fully supported
  already. Hero: upload several images in Admin → Homepage, it auto-
  rotates. Product rails (Featured/New Arrivals/Best Sellers): check the
  matching box on any product in Admin → Products, as many as you like
  will show.

## 2. What I implemented
- **Footer "Customer Care" column is now fully admin-editable** —
  Settings → Footer — Customer Care Links. Add, remove, reorder, relabel,
  or re-point any link — it's no longer hardcoded. Falls back to the
  original 5 links (Contact/Shipping/Returns/Terms/Privacy) until you
  change it. (The "Shop" column next to it stays as real site navigation,
  not made editable, since those are core routes rather than
  informational links — let me know if you want that editable too.)
- **Buy Now is now functional** (it was a leftover "coming soon" disabled
  button from before checkout existed) — it adds the selected variant to
  your bag and goes straight to checkout. Honest limitation: it checks
  out your *entire* cart, not just this one item, since that's how the
  checkout flow works — a true single-item bypass isn't built.
- **Buy Now visibility is admin-toggleable** — Settings → Product Page →
  "Show Buy Now button". Turn it off site-wide if you'd rather only offer
  Add to Bag / WhatsApp ordering.

## 3. Files added
```
components/admin/CustomerCareLinksManager.tsx
```
Modified: `lib/{config,actions/admin-settings}.ts`, `components/Footer.tsx`,
`components/admin/SettingsForm.tsx`, `components/product/VariantSelector.tsx`,
`app/(shop)/product/[slug]/page.tsx`, `app/admin/(dashboard)/settings/page.tsx`.

## 4. Database changes
None directly — `show_buy_now` and `footer_customer_care` are new
`site_settings` keys, created automatically the first time you save each
form (no migration needed).

---

# Customers Pagination, Bigger Categories, Colour Box, Site Background

## 1. What I implemented
- **Fixed real bug**: `/admin/customers` was capped at the first 50 sign-
  ups (Supabase Auth's `listUsers` is paginated). Now pages through all of
  them and shows a real total count.
- **Category tiles are noticeably bigger** — 3 per row on desktop instead
  of 5, in the same width, so each one is significantly larger.
- **Colour selector only shows when there's an actual choice** — if a
  product only has one colour across its variants, the box (which was a
  single button offering no real decision) is now hidden automatically.
  I did NOT remove it when a product genuinely has 2+ colours, since
  customers need some way to pick which one they want — happy to change
  this further if you want colour handled differently (e.g. shown as
  plain text instead of buttons), just let me know exactly what you have
  in mind.
- **Site-wide background pattern**: your mandala texture is now the fixed
  background across the whole site (not just the hero) — it sits behind
  every page, with the navbar's frosted-glass blur and the footer's solid
  color sitting on top of it, so it reads as a subtle decorative backdrop
  rather than competing with text. This also addresses the hero's "plain
  side" — that side was flat ivory before; now the same pattern shows
  through there too, tying the whole page together instead of just the
  hero photo having character.

## 2. Answering the rest directly (no code change needed)
- **Stock deduction**: already fully automatic — the database function
  that creates an order (`create_order_from_cart`) decrements the exact
  variant's stock the moment an order is placed, atomically, before
  anything else. You can ALSO manually adjust stock any time from
  `/admin/products/[id]/edit` → Variants & Stock — both already work
  together, nothing more to build here.
- **SKU** stands for "Stock Keeping Unit" — it's just a unique code you
  assign to identify a specific product or variant (e.g. `HB-BLK-M` for
  "Hana Burka, Black, Medium"). It's for your own inventory tracking —
  customers never need to see or use it. You can leave it blank on any
  product/variant if you don't have a coding system yet; nothing breaks.
- **Footer Customer Care editing**: this was built in the previous
  update — Admin → Settings → "Footer — Customer Care Links" (scroll
  down past Business Info). If that's not what you meant, tell me
  specifically what content there should be editable and I'll adjust.

## 3. Files added
```
public/bg-pattern.png
```
Modified: `app/admin/(dashboard)/customers/page.tsx`, `components/{CategoryGrid,
product/VariantSelector}.tsx`, `app/globals.css`.

---

# Background Revert, Page Content CMS, Floating WhatsApp, Mobile Menu

## 1. What I implemented
- **Background reverted** to the solid `#FDE5A5` gold color, pattern image
  removed.
- **Real CMS for static pages**: About, Shipping Policy, Return Policy,
  Privacy Policy, and Terms of Service now have their title and body text
  stored in the database and editable from **Admin → Pages**. This is
  what "Customer Care content editable from admin" actually needed — the
  footer links (done last round) just point to these pages; now the
  *content on* those pages is editable too, not just where they link.
  Each page falls back to the original placeholder text until you edit it.
- **Floating WhatsApp button** — fixed bottom-right on every customer
  page, springs in after a 1s delay, scales on hover/tap. Uses the same
  centralized WhatsApp number as everywhere else (admin-editable).
- **Real mobile navigation menu** — this was a significant, previously-
  unnoticed gap: on mobile, the nav links (Shop/Collections/New Arrivals/
  About) were simply hidden with no alternative way to reach them at all.
  Now there's a proper hamburger menu that slides down with a staggered
  reveal of each link, backdrop dims and closes on tap, body scroll locks
  while open.

## 2. Files added
```
lib/page-defaults.ts
components/{FloatingWhatsApp,admin/PageContentEditor}.tsx
app/admin/(dashboard)/pages/{page,[slug]/page}.tsx
```
Modified: `app/globals.css` (background revert), `lib/config.ts`
(getPageContent helper), `lib/actions/admin-settings.ts` (setPageContent),
`app/(shop)/{about,shipping-policy,return-policy,privacy-policy,terms}/page.tsx`
(now CMS-driven), `app/(shop)/layout.tsx` (floating WhatsApp added),
`components/NavbarClient.tsx` (rebuilt with mobile menu),
`components/admin/AdminSidebar.tsx` (Pages link added).

## 3. On "mobile responsive design for the whole website"
I fixed the most serious gap (no way to navigate on mobile at all) and
spot-checked the main layouts (hero, shop, checkout, footer) — they use
responsive grid classes that stack sensibly on narrow screens. I have
**not** done a full breakpoint-by-breakpoint audit of every page and
component, and I can't visually verify rendering on an actual phone
myself. Two things I noticed but haven't fixed:
- The **admin dashboard's sidebar is fixed-width and not mobile-
  responsive** — usable on desktop (its intended use case) but would be
  cramped on a phone. Since your brief for the motion pass explicitly
  said admin should prioritize speed over polish, I deprioritized this,
  but flagging it in case you manage the store from your phone.
- Product image galleries and some admin tables may need horizontal
  scroll on very small screens — not individually verified.

If you find specific pages that look broken on your phone, send me a
screenshot and I'll fix that exact one — that'll be faster and more
reliable than me guessing at a full audit.

---

# Mobile Navbar Polish, Hero Full-Bleed, Real WhatsApp Icon

## 1. What I implemented
- **Floating WhatsApp button now uses your actual icon image** instead of
  a custom-drawn SVG.
- **Mobile navbar rebuilt**: Cart is now a bag icon with a small badge
  count (was text "Cart (2)"), Search got its own dedicated icon button
  visible at all times (was buried inside the hamburger menu), and the
  cart icon shape matches the reference you sent.
- **Explicit Cancel button** added inside the mobile menu panel — you no
  longer have to tap the backdrop or hunt for the hamburger to close it.
- **Hero image is now full-bleed on mobile** — it stretches edge-to-edge
  (breaking out of the page's normal side padding) and uses a taller
  aspect ratio there, so it actually fills the screen the way you asked,
  while staying contained/proportional in the desktop layout.
- Added one more motion touch: "Why Hana" cards now stagger in one after
  another (matching the product rail treatment) instead of moving as a
  single block.

## 2. Files added
```
public/whatsapp-icon.webp
```
Modified: `components/{FloatingWhatsApp,NavbarClient,HeroMotion,WhyHana}.tsx`

---

# Full-Screen Hero Redesign, Home Nav Link, COD Removed, Bigger Mobile Images

## 1. What I implemented
- **Hero is now one full-viewport section**, not a split box-plus-text
  layout. The image fills the entire screen edge-to-edge, with the
  navbar floating transparently on top of it (turning frosted as you
  scroll, same as before), and the heading/description/buttons overlaid
  directly on the image with a gradient scrim behind them for
  readability. All the existing motion (word-reveal, blur-to-sharp, slow
  zoom, parallax, breathing drift, slideshow) still applies — now to the
  full-screen background. Text is left-aligned, bottom-anchored on
  mobile and vertically centered on desktop.
- ⚠️ **One thing I couldn't verify myself**: I pulled the hero up under
  the navbar using an estimated pixel offset so the navbar overlays it
  instead of pushing it down (needed for genuinely "full screen"). I
  can't see the actual rendered result — if there's a visible gap or the
  navbar clips awkwardly into the image, tell me and I'll adjust the
  exact offset.
- **"Home" added to the navbar** — both desktop and the mobile menu — so
  there's an explicit way back to the homepage besides clicking the logo.
- **Cash on Delivery removed entirely** — gone from checkout (only
  WhatsApp or Razorpay now, whichever admin has selected), gone from
  Admin → Settings. I didn't touch the database schema (the `cod` payment
  method still technically exists at the DB level for old orders that
  used it, and the `site_settings` "cod" row is just unused now) — no
  functional path can create a new COD order anymore.
- **Category and Collection tiles**: added a subtle 3D tilt-on-hover
  (interpreted your "rotating with motion" as a hover interaction, not an
  auto-rotating image carousel per tile — let me know if you actually
  meant multiple images cycling per category, that's a bigger feature I
  can build separately) plus bigger images on mobile (taller aspect
  ratio, larger gaps).
- **Product images bigger on mobile**: shop, search, new arrivals, and
  homepage product rails now show a single large column on the smallest
  phones (was always 2 cramped columns), stepping up to 2 then 3-4 as the
  screen grows.

## 2. Files added
None — all edits to existing files.
Modified: `components/HeroMotion.tsx` (full rewrite), `components/{NavbarClient,
CategoryGrid,WhyHana,ProductRail}.tsx`, `components/checkout/CheckoutForm.tsx`,
`components/admin/SettingsForm.tsx`, `lib/actions/{checkout,admin-settings}.ts`,
`app/(shop)/{checkout,collections}/page.tsx`,
`app/(shop)/{shop,search,new-arrivals}/page.tsx` (grid columns),
`app/(shop)/shop/loading.tsx`, `app/admin/(dashboard)/settings/page.tsx`.

## 3. Database changes
None.

---

# Performance, Security & Color Pass

## 1. What I implemented
- **Images**: converted several raw `<img>` tags to `next/image` across
  customer-facing components (category tiles, cart thumbnails, product
  gallery thumbnails), removed an unused 2.7MB `bg-pattern.png`,
  compressed `logo.png` 905KB → 86KB, and enabled AVIF/WebP output with
  30-day caching in `next.config.js`.
- **Security headers**: added a Content-Security-Policy (previously
  absent — Razorpay's script/iframe requirements hadn't been worked out)
  plus HSTS. ⚠️ Not click-tested against a live Razorpay payment.
- **Color**: added 5 small semantic accent colors (`sale`, `success`,
  `warning`, `danger`, `info`) to the Tailwind palette, used only where
  meaningful — the discount badge on product cards, and color-coded
  status pills on admin order list/detail and the customer's own order
  tracker. Not a palette overhaul.
- **Mobile responsive audit**: found and fixed a real bug — an admin
  Products table cell had `display:flex` applied directly to a `<td>`,
  which some mobile browsers render unreliably enough that the Edit/
  Delete links could become unclickable. Checked every other admin table
  for the same pattern; this was the only one.

## 2. Files added
None. Modified: `next.config.js`, `tailwind.config.ts`, `public/logo.png`
(replaced), `components/{CategoryGrid,cart/CartItemRow,product/{ProductCard,
ImageGallery}}.tsx`, `app/admin/(dashboard)/{orders,products}/page.tsx`,
`app/admin/(dashboard)/orders/[orderNumber]/page.tsx`,
`components/account/OrderStatusTimeline.tsx`,
`components/admin/StatusBadge.tsx` (new).

## 3. Database changes
None.

---

# Critical Fixes: Missing `sharp`, Next.js CVEs, CSP Blocking Dev Mode

## 1. What I implemented
- **`sharp` was never installed.** Next.js's image optimizer needs it for
  any non-Vercel deployment; without it, `next/image` requests fall back
  to a much slower path or fail outright. This was very likely the root
  cause of "images take a long time to load."
- **Next.js upgraded 14.2.5 → 14.2.35.** 14.2.5 was affected by a
  disclosed critical RCE (CVE-2025-66478) plus a DoS bug and a
  source-exposure bug. 14.2.34 alone left the DoS fix incomplete —
  14.2.35 is the actually-fully-patched version for the 14.x line.
- **CSP was blocking `eval()` in dev**, which Next's Fast Refresh/HMR
  runtime needs. This surfaced as a repeating `Uncaught EvalError` in the
  console and was very likely the real cause of "buttons not responding"
  reports from earlier in this engagement — not several separate bugs.
  Fixed by allowing `'unsafe-eval'` only when `NODE_ENV !== "production"`.
- Diagnosed (not a bug): the hero section showing no image was because no
  image had ever been uploaded via Admin → Homepage — the DB seed ships
  with `image_url: ""`. Rebuilt the empty-state placeholder so it looks
  intentional instead of broken until a real photo is added.

## 2. Files added
None. Modified: `package.json` (added `sharp`, bumped `next` +
`eslint-config-next`), `next.config.js` (CSP), `components/HeroMotion.tsx`
(empty-state placeholder, heading/description falsy-string fallback fix).

## 3. Database changes
None.

---

# WhatsApp Checkout Cleanup, Mobile Image Sizing

## 1. What I implemented
- Removed a standalone "Order via WhatsApp" button on the product page.
  It bypassed the entire cart/order system (no DB record, no tracking) —
  redundant now that Buy Now → Checkout already places a real, trackable
  order via WhatsApp by default (`checkout_mode` site setting defaults to
  `"whatsapp"`), using the same `create_order_from_cart` RPC as Razorpay
  orders. Account → Orders tracking already worked for both payment paths
  with no changes needed there.
- Bumped mobile image sizes (tighter padding/gap, same column count) on
  category grid, collections page, shop grid, and product rails.

## 2. Files added
None. Modified: `components/product/VariantSelector.tsx`,
`app/(shop)/product/[slug]/page.tsx`, `components/CategoryGrid.tsx`,
`app/(shop)/{collections,shop}/page.tsx`, `components/ProductRail.tsx`.

## 3. Database changes
None.

---

# Cart Overflow Bug, LCP/Favicon, Settings Query Caching

## 1. What I implemented
- **Real mobile bug fixed**: the cart row's content block was `flex-1`
  without `min-w-0`, so the quantity/save/remove controls couldn't
  shrink — this forced the entire page wider than the viewport on
  mobile. Fixed with `min-w-0` + `flex-wrap` + moving the line-total to
  its own row on small screens.
- Added `priority` to the actual LCP banner image (Next's own runtime
  diagnostics had flagged it), generated a proper favicon from the logo
  mark (was 404ing — none existed before).
- **Real performance win**: `getWhatsAppNumber()` and three sibling
  site-settings lookups (business info, footer links, page content) were
  querying Supabase on *every single page* via the shared shop layout.
  Cached all four for 5 minutes with `unstable_cache`.

## 2. Files added
`app/icon.png` (favicon). Modified: `components/cart/CartItemRow.tsx`,
`app/(shop)/cart/page.tsx`, `components/BannerStripClient.tsx`,
`lib/config.ts`.

## 3. Database changes
None.

---

# Full Animation Pass (15 items) + Cart Slide-Out Drawer

## 1. What I implemented
Worked through a detailed animation spec end to end. Several were
already partially built from earlier sessions and completed to exact
spec; the rest were built new:
- Product card image swap + lift, category/collection tile hover
  (zoom + overlay + arrow), hero cinematic entrance (scale/blur/drift),
  product-page cursor zoom, wishlist pop — tuned to spec where partially
  present, confirmed already-correct where fully present.
- Add-to-cart: checkmark feedback, fly-to-cart visual (button → cart
  icon), animated cart-count badge. The fly animation only fires after
  the server confirms the add succeeded (originally fired optimistically
  on click — moved after confirmation so it can't show success ahead of
  a real error).
- Button micro-interactions (hover lift + arrow shift + click
  compression) on Add to Bag / Buy Now.
- Filter/sort and search results now fade/stagger in instead of
  snapping; search icon expands into an inline input on desktop (kept as
  a plain link to `/search` on mobile — no room for an inline expand next
  to the cart/hamburger icons there).
- Footer reveal/stagger on scroll.
- Page-loading skeletons (matching real page shape) for Homepage,
  Collections, New Arrivals — extending the skeleton pattern that Shop
  and Product pages already had, rather than adding a competing
  logo-spinner pattern.
- Image loading shimmer, reusing the site's existing `.skeleton` CSS
  class, extended to category/collection tiles, banners, and cart
  thumbnails. (Caught and fixed my own near-miss here: initially added a
  *second*, differently-scaled `shimmer` keyframe via Tailwind config,
  which collided by name with the existing hand-written one in
  `globals.css` — removed the duplicate before it could ship.)
- Mobile tap-equivalents: hover-only effects (card lift, image swap,
  category/collection zoom) now also fire on touch press via a real tap
  state (`useIsTouchDevice` + Tailwind's `group-[.is-active]:` variant),
  not just desktop `:hover`. Confirmed the existing magnetic-button and
  hero-parallax effects already correctly disabled themselves on touch.
- Scroll-reveal speed shortened specifically on touch devices.
- **Cart slide-out drawer**: built end to end — a shared `getCartItems()`
  action (also de-duplicated the old `/cart` page's inline query logic
  onto it), a React Context provider mounted in the shop layout so the
  navbar (rendered per-page, not in a shared layout) and the drawer can
  coordinate, and the drawer UI itself reusing the existing
  `CartItemRow`. Both desktop and mobile cart icons now open the drawer
  instead of navigating directly; `/cart` remains reachable via "View
  Full Bag" and works standalone as before.

## 2. Files added
`components/{CategoryTile,CollectionTile,NavSearch}.tsx`,
`components/motion/flyToCart.ts`,
`components/cart/{CartDrawer,CartDrawerContext}.tsx`.
Modified: `components/product/{ProductCard,VariantSelector,ImageGallery}.tsx`,
`components/{CategoryGrid,NavbarClient,HeroMotion,WishlistButton,Footer}.tsx`,
`components/motion/{Reveal,StaggerGroup}.tsx`,
`app/(shop)/{shop,search,collections,cart,layout}.tsx`,
`app/(shop)/{collections,new-arrivals}/loading.tsx` (new),
`app/(shop)/loading.tsx` (new — homepage),
`app/(shop)/{shop,product/[slug]}/loading.tsx` (added a navbar-height
placeholder — they didn't have one, which caused the logo to visibly
disappear and pop back in during every load), `lib/actions/cart.ts`
(added `getCartItems`, and fixed all 4 cart mutations to
`revalidatePath("/", "layout")` in addition to `/cart` — the navbar cart
badge only refreshed if the shopper happened to visit `/cart` next, since
it renders fresh per-page rather than in a shared layout), `tailwind.config.ts`,
`app/globals.css` (`.cart-bump` keyframe).

## 3. Database changes
None.

---

# Critical Fix: `cookies()` Inside `unstable_cache` — Site-Wide Crash

## 1. What happened
The settings caching added in the previous session (`getWhatsAppNumber`
and its 3 siblings in `lib/config.ts`) used the cookie-based Supabase
client inside `unstable_cache`. Next.js forbids touching `cookies()`
inside a cache scope — this threw "Unhandled Runtime Error" on literally
every request, on every page, since the shop layout calls
`getWhatsAppNumber()` unconditionally. My bug, from my own earlier change.

## 2. The fix
All four lookups only ever read `site_settings`, which has a public-read
RLS policy (`using (true)`) — they never actually needed the visitor's
session. Added `createPublicClient()` (anon key, zero cookie access,
safe inside any cached function) and switched all four to use it, with an
explicit warning comment in `lib/config.ts` so this can't be
reintroduced by accident later.

## 3. Files added
`lib/supabase/public.ts`. Modified: `lib/config.ts`.

## 4. Database changes
None.

---

# Final Hardening: ESLint, Admin Login Security, Audit Log UI, Loading States

## 1. What I implemented
- **ESLint**: no config file existed at all. Added `.eslintrc.json`.
  First run surfaced 20 pre-existing `react/no-unescaped-entities`
  warnings (apostrophes/quotes in JSX text) from before this engagement —
  fixed all of them so `npm run lint` is actually clean, not just
  configured.
- **Admin login hardening** — required moving sign-in from a direct
  client-side Supabase call into a server action, since server-side rate
  limiting is otherwise impossible:
  - DB-backed lockout: 5 failed attempts locks that email for 15 minutes.
    DB-backed (not in-memory) because serverless function instances don't
    share memory between invocations.
  - Optional Cloudflare Turnstile CAPTCHA — off by default (an unset
    `TURNSTILE_SECRET_KEY` skips verification entirely, so this can't
    break login for anyone who hasn't set it up), documented in
    `.env.example`.
  - Caught before it shipped: the CAPTCHA token handler initially used a
    React 19-only ref-callback-cleanup pattern; this project is on React
    18, where that pattern silently leaks the event listener. Fixed with
    a plain `useEffect`.
- **Admin → Audit Log page — the read side of a system that was already
  built.** Discovered that full audit logging already existed at the
  database trigger level (migration 0007: product create/edit/delete,
  price changes, stock changes, order status changes) but nothing in the
  app ever queried the table — the data was being collected with no way
  to see it. Built the missing page, added it to the sidebar, and also
  wired login attempts (success/failed/blocked-inactive) into the same
  table so sign-in activity shows up alongside product/order activity in
  one place.
- **Admin loading skeletons** — none existed anywhere in the admin panel.
  Added for Dashboard, Orders, and Products (the three highest-traffic
  admin pages).
- **CSP audit**: after adding Turnstile, found it hadn't been added to
  the CSP's `script-src`/`connect-src`/`frame-src` — since the login
  button stays disabled until a CAPTCHA token arrives, turning on
  Turnstile without this fix would have permanently locked out every
  admin, including whoever configured it. Fixed. Then did a full sweep
  of every `https://` reference in the codebase against the CSP —
  everything else found (`hanaburka.com`, `schema.org`, `wa.me`,
  `instagram.com`) is a metadata string, JSON-LD identifier, or plain
  link href, none of which CSP restricts, so no further changes needed.

## 2. Files added
`.eslintrc.json`, `lib/auth/login-rate-limit.ts`, `lib/actions/admin-auth.ts`,
`app/admin/(dashboard)/audit-log/page.tsx`,
`app/(shop)/{cart,checkout,account,wishlist}/loading.tsx`,
`app/admin/(dashboard)/loading.tsx`,
`app/admin/(dashboard)/{orders,products}/loading.tsx`,
`supabase/migrations/0011_admin_login_rate_limit.sql`.
Modified: `app/admin/login/page.tsx` (rewritten), `components/admin/AdminSidebar.tsx`,
`.env.example`, `next.config.js` (CSP), 16 files with unescaped-entity fixes.

## 3. Database changes
New migration `0011_admin_login_rate_limit.sql`: `admin_login_attempts`
table (RLS enabled, zero policies — service-role-only by design, so a
locked-out attacker can't query it to see how close they are to the
limit), plus a `cleanup_old_login_attempts()` function to call
periodically (not currently scheduled — no cron is set up for it yet).

## 4. Known gaps / not done
- No live browser verification of anything in this engagement — all of
  it is typecheck-clean (`tsc --noEmit`) and lint-clean (`next lint`),
  and traced by hand for logical correctness, but never actually clicked
  through in a real browser. This is the single biggest thing worth
  doing next.
- Hero and several product photos still need to be uploaded via Admin —
  not a code task.
- `ImageGallery`'s main product photo intentionally has no shimmer/skeleton
  loading state — it already has its own blur-to-sharp reveal, and
  layering a second loading treatment on top would look muddled rather
  than better.
- `cleanup_old_login_attempts()` exists but isn't scheduled anywhere yet.

---

# Production Fix: Server-Action Errors Were Masked on the Live Site

## 1. What happened
On the deployed site (hanaburka.vercel.app), tapping **Buy Now** while
signed out showed "An error occurred in the Server Components render. The
specific message is omitted in production builds…" instead of sending the
shopper to `/login`. It worked in `npm run dev`.

Root cause: in production, Next.js replaces the message of any error
*thrown* out of a server action with that generic string. The product page
decided whether to redirect to login by checking
`err.message.includes("Sign in")` — which only ever matched in dev. Every
"expected" failure (not signed in, out of stock, invalid coupon, bad
phone number) had the same problem, because the code was written and
tested only against `next dev`.

## 2. The fix
Expected failures are now **returned**, never thrown (returned values are
not masked). New shared type `ActionResult` in `lib/actions/result.ts`:
`{ ok: true, ... } | { ok: false, code: "NOT_SIGNED_IN" | "FAILED", message }`.
Converted: `addToCart`, `toggleWishlist`, `placeOrder`,
`createRazorpayOrder`; and the four client components that call them
(`VariantSelector` Add to Bag + Buy Now, `WishlistButton`, `CheckoutForm`,
`RazorpayButton`).

Also:
- Checkout validation now uses `safeParse` and says e.g. "Please check your
  phone number and try again." (new `describeCheckoutIssue` helper in
  `checkout-schema.ts`) instead of throwing a raw Zod error.
- `createRazorpayOrder` now checks that `RAZORPAY_KEY_ID`/`SECRET` exist
  **before** creating the order. Previously it created the order (which
  reserves stock) and only then discovered the keys were missing.
- `moveWishlistItemToCart` checks `addToCart`'s result (it currently has no
  callers, but would have silently ignored a failed add).

## 3. Files
Added: `lib/actions/result.ts`.
Modified: `lib/actions/{cart,wishlist,checkout,checkout-schema,razorpay}.ts`,
`components/product/{VariantSelector,WishlistButton}.tsx`,
`components/checkout/{CheckoutForm,RazorpayButton}.tsx`.

## 4. Database changes
None.

## 5. Known gaps
- Same masked-error behaviour still exists in the **admin** forms
  (`ProductForm`, `VariantManager`, `CouponManager`, `CategoryManager`,
  `CollectionManager`, `BannerManager`, `ShipmentForm`, `PageContentEditor`,
  `CustomerCareLinksManager`, `HomepageEditor`) and the customer
  `ReturnRequestForm`: a failed save there shows the generic production
  message instead of the real reason. Same fix pattern applies; not done yet.
- Razorpay orders reserve stock at creation; an abandoned payment keeps
  that stock reserved (pre-existing, noted in `razorpay.ts`) — no cleanup job.
- Verified by `tsc --noEmit` (clean, nothing excluded) and `next lint`
  (clean) only. The actual production behaviour has not been exercised in a
  browser against the live site yet.
