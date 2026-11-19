-- Docly database schema for Supabase
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run once on a new project. Every table is private to the signed-in account (row-level security).

create extension if not exists pgcrypto;

-- ---------- Tables ----------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (length(name) between 1 and 120),
  rel text not null default 'you',
  tone text not null default 'teal',
  blood text,
  dob date,
  created_at timestamptz not null default now()
);

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (length(name) between 1 and 120),
  spec text not null default 'Doctor',
  tone text not null default 'teal',
  links jsonb not null default '[]'::jsonb,      -- [{ "label": "Website", "url": "https://..." }]
  chambers jsonb not null default '[]'::jsonb,   -- [{ "name": "Square Hospital", "info": "Panthapath · Sat–Wed, 6–8 PM" }]
  created_at timestamptz not null default now()
);

create table if not exists public.conditions (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  full_name text,
  status text not null default 'active' check (status in ('active','resolved')),
  since date,
  until date,
  created_at timestamptz not null default now()
);

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  date date not null,
  time time,
  chamber text,
  reason text,
  cond text,                 -- condition name; groups medical history
  cost numeric(12,2),
  follow date,               -- next follow-up
  said text,                 -- what the doctor said
  created_at timestamptz not null default now()
);

create table if not exists public.visit_pages (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  visit_id uuid not null references public.visits(id) on delete cascade,
  path text not null,        -- storage path inside the "records" bucket
  kind text not null default 'image' check (kind in ('image','pdf')),
  name text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid references public.doctors(id) on delete set null,
  visit_id uuid references public.visits(id) on delete set null,
  name text not null,
  status text not null default 'advised' check (status in ('advised','done','attached')),
  date date,
  venue text,
  cost numeric(12,2),
  report_path text,
  report_name text,
  report_kind text check (report_kind in ('image','pdf')),
  created_at timestamptz not null default now()
);

create table if not exists public.meds (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid references public.doctors(id) on delete set null,
  visit_id uuid references public.visits(id) on delete set null,
  name text not null,
  dose text,
  since date,
  until date,
  status text not null default 'current' check (status in ('current','stopped')),
  created_at timestamptz not null default now()
);

create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  icon text not null default 'history',
  text text not null,
  href text,
  who text,
  created_at timestamptz not null default now()
);

create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid references public.doctors(id) on delete cascade,   -- null = all doctors
  token text not null unique default encode(gen_random_bytes(12), 'hex'),
  expires_at timestamptz not null default now() + interval '24 hours',
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists doctors_profile_idx on public.doctors(profile_id);
create index if not exists visits_profile_idx on public.visits(profile_id, date desc);
create index if not exists tests_profile_idx on public.tests(profile_id);
create index if not exists meds_profile_idx on public.meds(profile_id);
create index if not exists activity_owner_idx on public.activity(owner, created_at desc);

-- ---------- Row-level security: each account sees only its own rows ----------
do $$
declare t text;
begin
  foreach t in array array['profiles','doctors','conditions','visits','visit_pages','tests','meds','activity','shares'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format('create policy "own rows" on public.%I for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid())', t);
    -- Newer Supabase projects don't grant table access to signed-in users by default.
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- ---------- File storage: private bucket, files live under <user id>/... ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('records', 'records', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic','application/pdf'])
on conflict (id) do nothing;

drop policy if exists "records: own folder read" on storage.objects;
drop policy if exists "records: own folder write" on storage.objects;
drop policy if exists "records: own folder update" on storage.objects;
drop policy if exists "records: own folder delete" on storage.objects;
create policy "records: own folder read"   on storage.objects for select to authenticated using (bucket_id = 'records' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "records: own folder write"  on storage.objects for insert to authenticated with check (bucket_id = 'records' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "records: own folder update" on storage.objects for update to authenticated using (bucket_id = 'records' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "records: own folder delete" on storage.objects for delete to authenticated using (bucket_id = 'records' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- Shared summary for a new doctor (read-only, no sign-in) ----------
-- Returns only what the share covers, and only while the link is valid.
create or replace function public.get_shared_summary(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare s public.shares; p public.profiles; result jsonb;
begin
  select * into s from public.shares where token = p_token and not revoked and expires_at > now();
  if not found then return null; end if;
  select * into p from public.profiles where id = s.profile_id;
  result := jsonb_build_object(
    'name', p.name,
    'shared_by', (select split_part(y.name, ' ', 1) from public.profiles y where y.owner = s.owner and y.rel = 'you' order by y.created_at limit 1),
    'age', case when p.dob is null then null else date_part('year', age(p.dob))::int end,
    'blood', p.blood,
    'expires_at', s.expires_at,
    'conditions', coalesce((select jsonb_agg(c.name) from public.conditions c where c.profile_id = p.id and c.status = 'active'), '[]'::jsonb),
    'meds', coalesce((select jsonb_agg(jsonb_build_object('name', m.name, 'dose', m.dose, 'since', m.since, 'doctor', d.name) order by m.since desc)
              from public.meds m left join public.doctors d on d.id = m.doctor_id
              where m.profile_id = p.id and m.status = 'current' and (s.doctor_id is null or m.doctor_id = s.doctor_id)), '[]'::jsonb),
    'visits', coalesce((select jsonb_agg(x) from (select jsonb_build_object('date', v.date, 'doctor', d.name, 'said', v.said) x
              from public.visits v join public.doctors d on d.id = v.doctor_id
              where v.profile_id = p.id and (s.doctor_id is null or v.doctor_id = s.doctor_id) order by v.date desc limit 5) q), '[]'::jsonb),
    'reports', coalesce((select jsonb_agg(jsonb_build_object('name', t.name, 'date', t.date, 'doctor', d.name) order by t.date desc)
              from public.tests t left join public.doctors d on d.id = t.doctor_id
              where t.profile_id = p.id and t.status = 'attached' and (s.doctor_id is null or t.doctor_id = s.doctor_id)), '[]'::jsonb)
  );
  return result;
end $$;
revoke all on function public.get_shared_summary(text) from public;
grant execute on function public.get_shared_summary(text) to anon, authenticated;

-- ---------- Delete my account: erases the user and every row they own ----------
-- The app removes the user's files from storage first, then calls this.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

-- ---------- Admin: Docly staff see accounts and counts, never record contents ----------
-- Add yourself as admin after you first sign in to the app:
--   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
drop policy if exists "admins see themselves" on public.admins;
create policy "admins see themselves" on public.admins for select to authenticated using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;
grant execute on function public.is_admin() to authenticated;

-- One row per account: who, when, and how much they have stored. No names of doctors, no notes, no files.
create or replace function public.admin_users()
returns table (
  user_id uuid, email text, signed_up timestamptz, last_sign_in timestamptz,
  profiles bigint, doctors bigint, visits bigint, tests bigint, meds bigint, files bigint, storage_bytes bigint, last_activity timestamptz
)
language plpgsql stable security definer set search_path = public, auth, storage
as $$
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  return query
  select u.id, u.email::text, u.created_at, u.last_sign_in_at,
    (select count(*) from public.profiles x where x.owner = u.id),
    (select count(*) from public.doctors x where x.owner = u.id),
    (select count(*) from public.visits x where x.owner = u.id),
    (select count(*) from public.tests x where x.owner = u.id),
    (select count(*) from public.meds x where x.owner = u.id),
    (select count(*) from storage.objects o where o.bucket_id = 'records' and (storage.foldername(o.name))[1] = u.id::text),
    (select coalesce(sum((o.metadata->>'size')::bigint), 0)::bigint from storage.objects o where o.bucket_id = 'records' and (storage.foldername(o.name))[1] = u.id::text),
    (select max(a.created_at) from public.activity a where a.owner = u.id)
  from auth.users u
  order by u.created_at desc;
end $$;
revoke all on function public.admin_users() from public;
grant execute on function public.admin_users() to authenticated;

create or replace function public.admin_overview()
returns jsonb language plpgsql stable security definer set search_path = public, auth, storage
as $$
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  return jsonb_build_object(
    'users', (select count(*) from auth.users),
    'new_7d', (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'active_7d', (select count(*) from auth.users where last_sign_in_at > now() - interval '7 days'),
    'profiles', (select count(*) from public.profiles),
    'visits', (select count(*) from public.visits),
    'visits_7d', (select count(*) from public.visits where created_at > now() - interval '7 days'),
    'tests', (select count(*) from public.tests),
    'meds', (select count(*) from public.meds),
    'files', (select count(*) from storage.objects where bucket_id = 'records'),
    'storage_bytes', (select coalesce(sum((metadata->>'size')::bigint), 0) from storage.objects where bucket_id = 'records'),
    'shares_active', (select count(*) from public.shares where not revoked and expires_at > now()),
    'signups_by_day', (select coalesce(jsonb_agg(jsonb_build_object('day', d, 'n', n) order by d), '[]'::jsonb)
                        from (select date_trunc('day', created_at)::date d, count(*) n from auth.users where created_at > now() - interval '30 days' group by 1) s)
  );
end $$;
revoke all on function public.admin_overview() from public;
grant execute on function public.admin_overview() to authenticated;

-- Remove an account on request. The admin page deletes the user's files through the Storage API first
-- (Supabase does not allow deleting storage rows with SQL), then calls this; all their rows cascade.
create or replace function public.admin_delete_user(p_user uuid)
returns void language plpgsql security definer set search_path = public, auth
as $$
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  if p_user = auth.uid() then raise exception 'You cannot delete your own admin account here'; end if;
  delete from auth.users where id = p_user;
end $$;
revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_delete_user(uuid) to authenticated;

-- ---------- Admin record access, with an access log (decided 2026-11-18) ----------
-- Every time an admin opens a user's records, a row is written here. Users can read the rows about themselves.
create table if not exists public.admin_access_log (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users(id) on delete set null,
  admin_email text,
  user_id uuid not null references auth.users(id) on delete cascade,
  what text not null,          -- e.g. 'all records', 'file: <path>'
  reason text,
  created_at timestamptz not null default now()
);
alter table public.admin_access_log enable row level security;
drop policy if exists "users see who viewed them" on public.admin_access_log;
drop policy if exists "admins see the log" on public.admin_access_log;
create policy "users see who viewed them" on public.admin_access_log for select to authenticated using (user_id = auth.uid());
create policy "admins see the log" on public.admin_access_log for select to authenticated using (public.is_admin());
create index if not exists admin_log_user_idx on public.admin_access_log(user_id, created_at desc);

create or replace function public.admin_log(p_user uuid, p_what text, p_reason text default null)
returns void language plpgsql security definer set search_path = public, auth
as $$
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  insert into public.admin_access_log (admin_id, admin_email, user_id, what, reason)
  values (auth.uid(), (select email from auth.users where id = auth.uid()), p_user, p_what, p_reason);
end $$;
revoke all on function public.admin_log(uuid, text, text) from public;
grant execute on function public.admin_log(uuid, text, text) to authenticated;

-- Returns all of one user's records and logs the view in the same call.
create or replace function public.admin_user_records(p_user uuid, p_reason text default null)
returns jsonb language plpgsql security definer set search_path = public, auth
as $$
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  perform public.admin_log(p_user, 'all records', p_reason);
  return jsonb_build_object(
    'email', (select email from auth.users where id = p_user),
    'profiles', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.profiles x where x.owner = p_user), '[]'),
    'doctors', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.doctors x where x.owner = p_user), '[]'),
    'visits', coalesce((select jsonb_agg(to_jsonb(x) order by x.date desc) from public.visits x where x.owner = p_user), '[]'),
    'visit_pages', coalesce((select jsonb_agg(to_jsonb(x) order by x.position) from public.visit_pages x where x.owner = p_user), '[]'),
    'tests', coalesce((select jsonb_agg(to_jsonb(x) order by x.date desc) from public.tests x where x.owner = p_user), '[]'),
    'meds', coalesce((select jsonb_agg(to_jsonb(x) order by x.since desc) from public.meds x where x.owner = p_user), '[]'),
    'conditions', coalesce((select jsonb_agg(to_jsonb(x)) from public.conditions x where x.owner = p_user), '[]')
  );
end $$;
revoke all on function public.admin_user_records(uuid, text) from public;
grant execute on function public.admin_user_records(uuid, text) to authenticated;

-- Admins may open any file in the records bucket; the admin page logs each file it opens through admin_log().
drop policy if exists "records: admins read" on storage.objects;
create policy "records: admins read" on storage.objects for select to authenticated using (bucket_id = 'records' and public.is_admin());
drop policy if exists "records: admins delete" on storage.objects;
create policy "records: admins delete" on storage.objects for delete to authenticated using (bucket_id = 'records' and public.is_admin());

-- ---------- Table access for signed-in users (RLS above still limits which rows) ----------
grant usage on schema public to authenticated;
grant select on public.admins to authenticated;
grant select on public.admin_access_log to authenticated;
