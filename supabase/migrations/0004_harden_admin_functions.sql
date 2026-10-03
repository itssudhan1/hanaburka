create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
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
set search_path = public
as $$
  select exists (
    select 1 from admin_users
    where id = auth.uid() and is_active = true and role = 'SUPER_ADMIN'
  );
$$;
