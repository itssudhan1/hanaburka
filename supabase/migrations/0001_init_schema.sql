-- ============================================================================
-- HANA BURKA — Phase 1: Core Schema
-- ============================================================================
-- Run this in Supabase SQL Editor (or via `supabase db push`) on a fresh project.
-- Safe to re-run: guarded with IF NOT EXISTS / DROP ... IF EXISTS where sensible.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
do $$ begin
  create type admin_role as enum ('SUPER_ADMIN', 'ADMIN', 'STAFF');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'pending', 'confirmed', 'processing', 'packed', 'shipped',
    'out_for_delivery', 'delivered', 'cancelled',
    'return_requested', 'returned', 'refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('razorpay', 'cod');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type coupon_type as enum ('percentage', 'flat');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- PROFILES (extends auth.users)
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ADMIN USERS
-- ----------------------------------------------------------------------------
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role admin_role not null default 'STAFF',
  full_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- CATEGORIES
-- ----------------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- COLLECTIONS
-- ----------------------------------------------------------------------------
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- PRODUCTS
-- ----------------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text unique,
  short_description text,
  full_description text,
  category_id uuid references categories(id) on delete set null,
  collection_id uuid references collections(id) on delete set null,
  price numeric(10,2) not null,
  mrp numeric(10,2) not null,
  fabric text,
  length text,
  style text,
  care_instructions text,
  tags text[] default '{}',
  video_url text,
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  is_new_arrival boolean not null default false,
  is_published boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_collection on products(collection_id);
create index if not exists idx_products_published on products(is_published);
create index if not exists idx_products_slug on products(slug);

-- ----------------------------------------------------------------------------
-- PRODUCT VARIANTS (colour x size, each with own stock/price/image)
-- ----------------------------------------------------------------------------
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  sku text unique,
  colour text,
  size text,
  price numeric(10,2),
  stock int not null default 0,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, colour, size)
);
create index if not exists idx_variants_product on product_variants(product_id);

-- ----------------------------------------------------------------------------
-- PRODUCT IMAGES
-- ----------------------------------------------------------------------------
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_images_product on product_images(product_id);

-- ----------------------------------------------------------------------------
-- INVENTORY (audit-tracked stock, separate from product_variants.stock cache)
-- ----------------------------------------------------------------------------
create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants(id) on delete cascade,
  available int not null default 0,
  reserved int not null default 0,
  sold int not null default 0,
  returned int not null default 0,
  low_stock_threshold int not null default 5,
  updated_at timestamptz not null default now(),
  unique (variant_id)
);

-- ----------------------------------------------------------------------------
-- ADDRESSES
-- ----------------------------------------------------------------------------
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  area text,
  city text not null,
  state text not null,
  pincode text not null,
  country text not null default 'India',
  delivery_instructions text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_addresses_user on addresses(user_id);

-- ----------------------------------------------------------------------------
-- CART ITEMS
-- ----------------------------------------------------------------------------
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  saved_for_later boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, variant_id)
);

-- ----------------------------------------------------------------------------
-- WISHLISTS
-- ----------------------------------------------------------------------------
create table if not exists wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  created_at timestamptz not null default now()
);

create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references wishlists(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);

-- ----------------------------------------------------------------------------
-- COUPONS
-- ----------------------------------------------------------------------------
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type coupon_type not null,
  value numeric(10,2) not null,
  min_order_amount numeric(10,2),
  max_discount_amount numeric(10,2),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit int,
  first_order_only boolean not null default false,
  product_id uuid references products(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  customer_id uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists coupon_usage (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references coupons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid,
  used_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ORDERS / ORDER ITEMS
-- ----------------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  status order_status not null default 'pending',
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  shipping_fee numeric(10,2) not null default 0,
  cod_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  coupon_id uuid references coupons(id) on delete set null,
  payment_method payment_method not null,
  payment_status payment_status not null default 'pending',
  shipping_address jsonb not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  order_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_status on orders(status);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete restrict,
  product_name text not null,
  sku text,
  colour text,
  size text,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null
);
create index if not exists idx_order_items_order on order_items(order_id);

-- ----------------------------------------------------------------------------
-- PAYMENTS
-- ----------------------------------------------------------------------------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  amount numeric(10,2) not null,
  status payment_status not null default 'pending',
  raw_response jsonb,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- SHIPMENTS / RETURNS
-- ----------------------------------------------------------------------------
create table if not exists shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  carrier text,
  tracking_number text,
  tracking_url text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  order_item_id uuid references order_items(id) on delete set null,
  reason text,
  status text not null default 'requested',
  refund_amount numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- REVIEWS (purchase-verified only)
-- ----------------------------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_item_id uuid references order_items(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  images text[] default '{}',
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_reviews_product on reviews(product_id);

-- ----------------------------------------------------------------------------
-- BANNERS / HOMEPAGE CMS / SITE SETTINGS
-- ----------------------------------------------------------------------------
create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  link_url text,
  placement text not null default 'homepage',
  sort_order int not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique, -- e.g. 'hero', 'announcement_bar', 'why_hana', 'newsletter'
  content jsonb not null default '{}',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- AUDIT LOGS
-- ----------------------------------------------------------------------------
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_admin on audit_logs(admin_id);
create index if not exists idx_audit_entity on audit_logs(entity, entity_id);

-- ----------------------------------------------------------------------------
-- NEWSLETTER
-- ----------------------------------------------------------------------------
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now()
);
