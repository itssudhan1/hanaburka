-- Add 'whatsapp' as a real payment method (order confirmed manually via
-- WhatsApp, no online payment capture).
alter type payment_method add value if not exists 'whatsapp';

-- Site-wide switch: which checkout experience customers see.
-- Admin can flip this any time from Settings — no code change needed.
insert into site_settings (key, value) values
  ('checkout_mode', '{"mode": "whatsapp"}')
on conflict (key) do nothing;

-- Shipping fee rule, matching the "Free Shipping Above ₹1999" announcement.
insert into site_settings (key, value) values
  ('shipping', '{"free_threshold": 1999, "flat_fee": 99}')
on conflict (key) do nothing;
