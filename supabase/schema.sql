-- ============================================================================
-- FRC Academy - Supabase schema, security, and helper functions
-- Run this once in your Supabase project: SQL Editor -> New query -> paste -> Run.
-- See BACKEND-SETUP.md for the full walkthrough.
-- Safe to re-run: it drops and recreates its own objects.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  join_code   text not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null default '',
  role          text not null default 'student' check (role in ('student','mentor','admin')),
  team_id       uuid references public.teams(id) on delete set null,
  created_at    timestamptz not null default now()
);

create table if not exists public.progress (
  user_id     uuid not null references auth.users(id) on delete cascade,
  course      text not null,            -- 'deploy' | 'closing-the-loop' | 'build' | 'systemcore'
  item_key    text not null,            -- the lesson filename, e.g. 'deploy-lesson-12.html'
  done        boolean not null default true,
  updated_at  timestamptz not null default now(),
  primary key (user_id, item_key)
);

create index if not exists progress_user_idx on public.progress(user_id);
create index if not exists profiles_team_idx on public.profiles(team_id);

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER so policies can read the caller's
-- profile WITHOUT triggering row-level-security recursion).
-- ---------------------------------------------------------------------------

create or replace function public.current_role() returns text
  language sql security definer stable set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_team() returns uuid
  language sql security definer stable set search_path = public as $$
  select team_id from public.profiles where id = auth.uid()
$$;

-- Is the given user on the same team as the caller? (Used by mentor read policy.)
create or replace function public.same_team(p_user uuid) returns boolean
  language sql security definer stable set search_path = public as $$
  select exists (
    select 1
    from public.profiles s
    join public.profiles m on m.id = auth.uid()
    where s.id = p_user
      and m.team_id is not null
      and s.team_id = m.team_id
  )
$$;

-- ---------------------------------------------------------------------------
-- New-user trigger: every auth signup gets a profile row (role student).
-- The display name comes from the signup metadata if provided.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Self-service RPCs (SECURITY DEFINER: they bypass RLS but enforce their own
-- rules, so students can change ONLY their own display name and team, and can
-- never grant themselves a role).
-- ---------------------------------------------------------------------------

-- A student sets their own display name.
create or replace function public.set_display_name(p_name text) returns void
  language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  update public.profiles set display_name = left(trim(p_name), 60) where id = auth.uid();
end;
$$;

-- A student joins a team by its code.
create or replace function public.join_team(p_code text) returns uuid
  language plpgsql security definer set search_path = public as $$
declare t uuid;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select id into t from public.teams where join_code = upper(trim(p_code));
  if t is null then raise exception 'That join code does not match any team'; end if;
  update public.profiles set team_id = t where id = auth.uid();
  return t;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin RPCs (only role = 'admin' may call them).
-- ---------------------------------------------------------------------------

create or replace function public.admin_create_team(p_name text, p_code text) returns uuid
  language plpgsql security definer set search_path = public as $$
declare t uuid;
begin
  if public.current_role() <> 'admin' then raise exception 'Admins only'; end if;
  insert into public.teams (name, join_code)
  values (left(trim(p_name), 80), upper(trim(p_code)))
  returning id into t;
  return t;
end;
$$;

-- Set a member's role and/or team. Pass null to leave a field unchanged.
create or replace function public.admin_set_member(p_user uuid, p_role text, p_team uuid) returns void
  language plpgsql security definer set search_path = public as $$
begin
  if public.current_role() <> 'admin' then raise exception 'Admins only'; end if;
  if p_role is not null and p_role not in ('student','mentor','admin') then
    raise exception 'Invalid role';
  end if;
  update public.profiles
     set role    = coalesce(p_role, role),
         team_id = coalesce(p_team, team_id)
   where id = p_user;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------

alter table public.teams    enable row level security;
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

-- ---- profiles -----------------------------------------------------------
drop policy if exists "read own profile"          on public.profiles;
drop policy if exists "mentor reads team profiles" on public.profiles;
drop policy if exists "admin reads all profiles"  on public.profiles;

create policy "read own profile" on public.profiles
  for select using (id = auth.uid());

create policy "mentor reads team profiles" on public.profiles
  for select using (
    public.current_role() = 'mentor' and team_id = public.current_team()
  );

create policy "admin reads all profiles" on public.profiles
  for select using (public.current_role() = 'admin');

-- No direct INSERT/UPDATE/DELETE for users: profile creation is the trigger,
-- and changes go through the SECURITY DEFINER RPCs above.

-- ---- teams --------------------------------------------------------------
drop policy if exists "members read their team" on public.teams;
drop policy if exists "admin reads all teams"   on public.teams;

create policy "members read their team" on public.teams
  for select using (id = public.current_team());

create policy "admin reads all teams" on public.teams
  for select using (public.current_role() = 'admin');

-- ---- progress -----------------------------------------------------------
drop policy if exists "student manages own progress" on public.progress;
drop policy if exists "mentor reads team progress"   on public.progress;
drop policy if exists "admin reads all progress"     on public.progress;

create policy "student manages own progress" on public.progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "mentor reads team progress" on public.progress
  for select using (
    public.current_role() = 'mentor' and public.same_team(progress.user_id)
  );

create policy "admin reads all progress" on public.progress
  for select using (public.current_role() = 'admin');

-- ============================================================================
-- AFTER you create your own account through the app, make yourself the admin:
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');
-- ============================================================================
