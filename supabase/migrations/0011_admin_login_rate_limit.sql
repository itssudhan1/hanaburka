-- ----------------------------------------------------------------------------
-- ADMIN LOGIN ATTEMPTS — backs server-side rate limiting / lockout on
-- /admin/login. Written only by the server action (service_role), never
-- readable or writable by the browser — a locked-out attacker should not
-- be able to query this table to see how close they are to the limit.
-- ----------------------------------------------------------------------------
create table if not exists admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  success boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_admin_login_attempts_email_time
  on admin_login_attempts(email, created_at desc);

alter table admin_login_attempts enable row level security;
-- No policies at all: RLS enabled with zero policies means every role
-- except service_role (which bypasses RLS entirely) is denied both read
-- and write, by default-deny. That's intentional here.

-- Old rows are only ever needed for a short lockout window (see
-- lib/auth/login-rate-limit.ts) — without cleanup this table grows
-- forever on a busy site. Safe to call this periodically (e.g. a daily
-- cron via Supabase's pg_cron, or just manually from the SQL editor);
-- nothing else in the app depends on rows older than a day.
create or replace function cleanup_old_login_attempts()
returns void
language sql
security definer
set search_path = public
as $$
  delete from admin_login_attempts where created_at < now() - interval '1 day';
$$;
