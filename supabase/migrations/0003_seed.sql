-- ============================================================================
-- HANA BURKA — Phase 1: Seed data
-- Initial categories, collections, homepage CMS defaults, and site settings.
-- ============================================================================

insert into categories (name, slug, sort_order) values
  ('Burkas', 'burkas', 1),
  ('Abayas', 'abayas', 2),
  ('Hijabs', 'hijabs', 3),
  ('Inner Caps', 'inner-caps', 4),
  ('Accessories', 'accessories', 5)
on conflict (slug) do nothing;

insert into collections (name, slug, sort_order) values
  ('New Arrivals', 'new-arrivals', 1),
  ('Premium Burkas', 'premium-burkas', 2),
  ('Everyday Collection', 'everyday-collection', 3),
  ('Eid Collection', 'eid-collection', 4),
  ('Ramadan Collection', 'ramadan-collection', 5),
  ('Office Wear', 'office-wear', 6),
  ('Party Wear', 'party-wear', 7),
  ('Travel Collection', 'travel-collection', 8),
  ('Black Collection', 'black-collection', 9)
on conflict (slug) do nothing;

insert into homepage_sections (section_key, content) values
  ('announcement_bar', '{"text": "Free Shipping on Orders Above ₹1999", "is_active": true}'),
  ('hero', '{
    "heading": "ELEGANCE IN MODESTY",
    "description": "Discover beautifully crafted burkas designed for comfort, confidence and everyday elegance.",
    "image_url": "",
    "primary_button": {"label": "SHOP BURKAS", "href": "/shop"},
    "secondary_button": {"label": "EXPLORE COLLECTION", "href": "/collections"}
  }'),
  ('why_hana', '{
    "cards": [
      {"title": "Premium Fabrics", "description": ""},
      {"title": "Elegant Designs", "description": ""},
      {"title": "Comfort First", "description": ""},
      {"title": "Trusted Service", "description": ""}
    ]
  }'),
  ('newsletter', '{"heading": "Join the Hana Burka circle", "subheading": ""}')
on conflict (section_key) do nothing;

insert into site_settings (key, value) values
  ('cod', '{"enabled": true, "min_order": 500, "max_order": 15000, "fee": 0}'),
  ('whatsapp', '{"number": ""}'),
  ('brand', '{"name": "HANA BURKA", "tagline": "Elegance in Modesty"}')
on conflict (key) do nothing;
