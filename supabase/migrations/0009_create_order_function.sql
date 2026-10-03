-- ============================================================================
-- create_order_from_cart: the ONE place order totals get computed.
-- Runs as a single atomic transaction (Postgres function body), so there's
-- no window where two checkouts can oversell the same variant, and the
-- client can never influence price/total — everything is read fresh from
-- the DB inside this function.
-- ============================================================================

create or replace function create_order_from_cart(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_shipping_address jsonb,
  p_payment_method payment_method,
  p_order_note text default null
)
returns table(order_id uuid, order_number text, total numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric := 0;
  v_shipping_fee numeric := 0;
  v_cod_fee numeric := 0;
  v_total numeric := 0;
  v_free_threshold numeric;
  v_flat_shipping numeric;
  v_cod_settings jsonb;
  v_item record;
  v_unit_price numeric;
begin
  if v_user_id is null then
    raise exception 'Not signed in';
  end if;

  if not exists (
    select 1 from cart_items where user_id = v_user_id and saved_for_later = false
  ) then
    raise exception 'Cart is empty';
  end if;

  -- Lock the variant rows this checkout touches, so a concurrent checkout
  -- on the same stock has to wait rather than both succeeding and overselling.
  perform 1
  from cart_items ci
  join product_variants pv on pv.id = ci.variant_id
  where ci.user_id = v_user_id and ci.saved_for_later = false
  for update of pv;

  -- Validate stock for every item BEFORE writing anything.
  for v_item in
    select pv.id as variant_id, ci.quantity, pv.stock, p.name as product_name
    from cart_items ci
    join product_variants pv on pv.id = ci.variant_id
    join products p on p.id = pv.product_id
    where ci.user_id = v_user_id and ci.saved_for_later = false
  loop
    if v_item.stock < v_item.quantity then
      raise exception 'Insufficient stock for %', v_item.product_name;
    end if;
  end loop;

  -- Subtotal computed from the DB's own current prices — the client never
  -- supplies a price or total anywhere in this flow.
  select coalesce(sum(coalesce(pv.price, p.price) * ci.quantity), 0)
  into v_subtotal
  from cart_items ci
  join product_variants pv on pv.id = ci.variant_id
  join products p on p.id = pv.product_id
  where ci.user_id = v_user_id and ci.saved_for_later = false;

  select coalesce((value->>'free_threshold')::numeric, 1999),
         coalesce((value->>'flat_fee')::numeric, 99)
  into v_free_threshold, v_flat_shipping
  from site_settings where key = 'shipping';

  v_shipping_fee := case
    when v_subtotal >= coalesce(v_free_threshold, 1999) then 0
    else coalesce(v_flat_shipping, 99)
  end;

  if p_payment_method = 'cod' then
    select value into v_cod_settings from site_settings where key = 'cod';

    if v_cod_settings is not null and (v_cod_settings->>'enabled')::boolean is false then
      raise exception 'Cash on Delivery is currently unavailable';
    end if;

    v_cod_fee := coalesce((v_cod_settings->>'fee')::numeric, 0);

    if v_cod_settings ? 'min_order' and v_subtotal < (v_cod_settings->>'min_order')::numeric then
      raise exception 'Order amount is below the minimum for Cash on Delivery';
    end if;
    if v_cod_settings ? 'max_order' and v_subtotal > (v_cod_settings->>'max_order')::numeric then
      raise exception 'Order amount exceeds the maximum for Cash on Delivery';
    end if;
  end if;

  v_total := v_subtotal + v_shipping_fee + v_cod_fee;
  v_order_number := 'HB' || to_char(now(), 'YYMMDD') || lpad(floor(random() * 10000)::text, 4, '0');

  insert into orders (
    order_number, user_id, status, subtotal, discount, shipping_fee, cod_fee,
    total, payment_method, payment_status, shipping_address,
    customer_name, customer_phone, customer_email, order_note
  ) values (
    v_order_number, v_user_id, 'pending', v_subtotal, 0, v_shipping_fee, v_cod_fee,
    v_total, p_payment_method, 'pending', p_shipping_address,
    p_customer_name, p_customer_phone, p_customer_email, p_order_note
  )
  returning id into v_order_id;

  for v_item in
    select ci.id as cart_item_id, pv.id as variant_id, ci.quantity,
           pv.price as variant_price, pv.colour, pv.size, pv.sku,
           p.price as product_price, p.name as product_name
    from cart_items ci
    join product_variants pv on pv.id = ci.variant_id
    join products p on p.id = pv.product_id
    where ci.user_id = v_user_id and ci.saved_for_later = false
  loop
    v_unit_price := coalesce(v_item.variant_price, v_item.product_price);

    insert into order_items (
      order_id, variant_id, product_name, sku, colour, size,
      quantity, unit_price, line_total
    ) values (
      v_order_id, v_item.variant_id, v_item.product_name, v_item.sku,
      v_item.colour, v_item.size, v_item.quantity, v_unit_price,
      v_unit_price * v_item.quantity
    );

    update product_variants
    set stock = stock - v_item.quantity
    where id = v_item.variant_id;
  end loop;

  delete from cart_items where user_id = v_user_id and saved_for_later = false;

  return query select v_order_id, v_order_number, v_total;
end;
$$;

grant execute on function create_order_from_cart(text, text, text, jsonb, payment_method, text) to authenticated;
