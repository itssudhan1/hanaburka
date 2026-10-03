-- ============================================================================
-- HANA BURKA — Phase 1: Row Level Security
-- ============================================================================
-- Principle: RLS is the last line of defense. Every table a customer's
-- browser can touch directly (via the anon/publishable key) MUST have RLS
-- enabled with an explicit policy. Admin write operations happen through
-- server-side routes using the service_role key, which bypasses RLS —
-- so the *server route* must re-check admin_users.role before writing.
-- ============================================================================

-- Helper: is the current auth.uid() an active admin, and of which role?
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admin_users
    where id = auth.uid() and is_active = true
  );
$$;

create or replace function is_super_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admin_users
    where id = auth.uid() and is_active = true and role = 'SUPER_ADMIN'
  );
$$;

-- ----------------------------------------------------------------------------
-- PROFILES
-- ----------------------------------------------------------------------------
alter table profiles enable row level security;

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- ADMIN USERS — only super admins can see/manage the admin roster
-- ----------------------------------------------------------------------------
alter table admin_users enable row level security;

create policy "admin_users_select" on admin_users
  for select using (is_admin());
create policy "admin_users_manage" on admin_users
  for all using (is_super_admin()) with check (is_super_admin());

-- ----------------------------------------------------------------------------
-- CATALOG (public read of published items; writes admin-only)
-- ----------------------------------------------------------------------------
alter table categories enable row level security;
create policy "categories_public_read" on categories
  for select using (is_published = true or is_admin());
create policy "categories_admin_write" on categories
  for all using (is_admin()) with check (is_admin());

alter table collections enable row level security;
create policy "collections_public_read" on collections
  for select using (is_published = true or is_admin());
create policy "collections_admin_write" on collections
  for all using (is_admin()) with check (is_admin());

alter table products enable row level security;
create policy "products_public_read" on products
  for select using (is_published = true or is_admin());
create policy "products_admin_write" on products
  for all using (is_admin()) with check (is_admin());

alter table product_variants enable row level security;
create policy "variants_public_read" on product_variants
  for select using (
    is_active = true or is_admin()
  );
create policy "variants_admin_write" on product_variants
  for all using (is_admin()) with check (is_admin());

alter table product_images enable row level security;
create policy "images_public_read" on product_images
  for select using (true);
create policy "images_admin_write" on product_images
  for all using (is_admin()) with check (is_admin());

alter table inventory enable row level security;
create policy "inventory_admin_only" on inventory
  for all using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- ADDRESSES — strictly own-user
-- ----------------------------------------------------------------------------
alter table addresses enable row level security;
create policy "addresses_owner" on addresses
  for all using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- CART — strictly own-user
-- ----------------------------------------------------------------------------
alter table cart_items enable row level security;
create policy "cart_owner" on cart_items
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- WISHLIST — strictly own-user
-- ----------------------------------------------------------------------------
alter table wishlists enable row level security;
create policy "wishlist_owner" on wishlists
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table wishlist_items enable row level security;
create policy "wishlist_items_owner" on wishlist_items
  for all using (
    exists (select 1 from wishlists w where w.id = wishlist_id and w.user_id = auth.uid())
  )
  with check (
    exists (select 1 from wishlists w where w.id = wishlist_id and w.user_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- COUPONS — customers can read active coupons only to validate at checkout;
-- actual validation logic still re-runs server-side, never trust client math
-- ----------------------------------------------------------------------------
alter table coupons enable row level security;
create policy "coupons_read_active" on coupons
  for select using (is_active = true or is_admin());
create policy "coupons_admin_write" on coupons
  for all using (is_admin()) with check (is_admin());

alter table coupon_usage enable row level security;
create policy "coupon_usage_owner_read" on coupon_usage
  for select using (auth.uid() = user_id or is_admin());
create policy "coupon_usage_admin_write" on coupon_usage
  for all using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- ORDERS / ORDER ITEMS — customers see only their own; all writes server-side
-- ----------------------------------------------------------------------------
alter table orders enable row level security;
create policy "orders_owner_read" on orders
  for select using (auth.uid() = user_id or is_admin());
create policy "orders_admin_write" on orders
  for all using (is_admin()) with check (is_admin());

alter table order_items enable row level security;
create policy "order_items_owner_read" on order_items
  for select using (
    exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin()))
  );
create policy "order_items_admin_write" on order_items
  for all using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- PAYMENTS / SHIPMENTS / RETURNS — sensitive; owner read-only, admin full
-- ----------------------------------------------------------------------------
alter table payments enable row level security;
create policy "payments_owner_read" on payments
  for select using (
    exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin()))
  );
create policy "payments_admin_write" on payments
  for all using (is_admin()) with check (is_admin());

alter table shipments enable row level security;
create policy "shipments_owner_read" on shipments
  for select using (
    exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin()))
  );
create policy "shipments_admin_write" on shipments
  for all using (is_admin()) with check (is_admin());

alter table returns enable row level security;
create policy "returns_owner_read" on returns
  for select using (
    exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin()))
  );
create policy "returns_owner_insert" on returns
  for insert with check (
    exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
  );
create policy "returns_admin_write" on returns
  for update using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- REVIEWS — public reads approved reviews; only verified purchasers write
-- ----------------------------------------------------------------------------
alter table reviews enable row level security;
create policy "reviews_public_read" on reviews
  for select using (is_approved = true or auth.uid() = user_id or is_admin());
create policy "reviews_verified_purchase_insert" on reviews
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from order_items oi
      join orders o on o.id = oi.order_id
      where oi.id = order_item_id
        and o.user_id = auth.uid()
        and o.status in ('delivered')
    )
  );
create policy "reviews_admin_moderate" on reviews
  for update using (is_admin()) with check (is_admin());
create policy "reviews_admin_delete" on reviews
  for delete using (is_admin());

-- ----------------------------------------------------------------------------
-- CMS / SETTINGS — public read, admin write
-- ----------------------------------------------------------------------------
alter table banners enable row level security;
create policy "banners_public_read" on banners
  for select using (is_active = true or is_admin());
create policy "banners_admin_write" on banners
  for all using (is_admin()) with check (is_admin());

alter table homepage_sections enable row level security;
create policy "homepage_public_read" on homepage_sections
  for select using (is_active = true or is_admin());
create policy "homepage_admin_write" on homepage_sections
  for all using (is_admin()) with check (is_admin());

alter table site_settings enable row level security;
create policy "settings_public_read" on site_settings
  for select using (true);
create policy "settings_admin_write" on site_settings
  for all using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- AUDIT LOGS — admin read-only, written only by server-side service role
-- ----------------------------------------------------------------------------
alter table audit_logs enable row level security;
create policy "audit_admin_read" on audit_logs
  for select using (is_admin());
-- Intentionally no insert/update/delete policy for regular roles.
-- Audit rows are written exclusively by server routes using the
-- service_role key (which bypasses RLS), never by the browser.

-- ----------------------------------------------------------------------------
-- NEWSLETTER — anyone can subscribe, only admin can read the list
-- ----------------------------------------------------------------------------
alter table newsletter_subscribers enable row level security;
create policy "newsletter_public_insert" on newsletter_subscribers
  for insert with check (true);
create policy "newsletter_admin_read" on newsletter_subscribers
  for select using (is_admin());
