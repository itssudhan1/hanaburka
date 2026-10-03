create or replace function sync_inventory_on_variant_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into inventory (variant_id, available)
    values (new.id, new.stock)
    on conflict (variant_id) do update set available = excluded.available, updated_at = now();
    return new;
  end if;

  if (tg_op = 'UPDATE' and new.stock is distinct from old.stock) then
    update inventory
    set available = new.stock, updated_at = now()
    where variant_id = new.id;

    insert into audit_logs (admin_id, action, entity, entity_id, metadata)
    values (
      auth.uid(),
      'stock_changed',
      'product_variants',
      new.id::text,
      jsonb_build_object('old_stock', old.stock, 'new_stock', new.stock, 'sku', new.sku)
    );
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_inventory on product_variants;
create trigger trg_sync_inventory
after insert or update on product_variants
for each row execute function sync_inventory_on_variant_change();

create or replace function audit_product_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into audit_logs (admin_id, action, entity, entity_id, metadata)
    values (auth.uid(), 'product_created', 'products', new.id::text, jsonb_build_object('name', new.name));
    return new;
  elsif (tg_op = 'UPDATE') then
    if (new.price is distinct from old.price or new.mrp is distinct from old.mrp) then
      insert into audit_logs (admin_id, action, entity, entity_id, metadata)
      values (auth.uid(), 'price_changed', 'products', new.id::text,
        jsonb_build_object('old_price', old.price, 'new_price', new.price, 'old_mrp', old.mrp, 'new_mrp', new.mrp));
    else
      insert into audit_logs (admin_id, action, entity, entity_id, metadata)
      values (auth.uid(), 'product_edited', 'products', new.id::text, jsonb_build_object('name', new.name));
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    insert into audit_logs (admin_id, action, entity, entity_id, metadata)
    values (auth.uid(), 'product_deleted', 'products', old.id::text, jsonb_build_object('name', old.name));
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_audit_product on products;
create trigger trg_audit_product
after insert or update or delete on products
for each row execute function audit_product_change();

create or replace function audit_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.status is distinct from old.status) then
    insert into audit_logs (admin_id, action, entity, entity_id, metadata)
    values (auth.uid(), 'order_status_changed', 'orders', new.id::text,
      jsonb_build_object('old_status', old.status, 'new_status', new.status));
  end if;
  return new;
end;
$$;

drop trigger if exists trg_audit_order_status on orders;
create trigger trg_audit_order_status
after update on orders
for each row execute function audit_order_status_change();
