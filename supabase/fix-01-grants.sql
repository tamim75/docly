-- Fix: "permission denied for table profiles"
-- Newer Supabase projects don't give signed-in users access to new tables automatically.
-- Row-level security still applies, so each account only sees its own rows.
grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.profiles, public.doctors, public.conditions, public.visits, public.visit_pages,
  public.tests, public.meds, public.activity, public.shares
to authenticated;
grant select on public.admins, public.admin_access_log to authenticated;
