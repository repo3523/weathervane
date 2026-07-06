-- Weathervane schema
-- Paste this entire file into the Supabase SQL Editor and Run.
-- Run it once; re-running is safe (IF NOT EXISTS guards throughout).

-- ── Tables ────────────────────────────────────────────────────────────────

create table if not exists public.child_profiles (
  id         uuid primary key default gen_random_uuid(),
  parent_id  uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  created_at timestamptz default now()
);

-- Full theme object stored as JSONB — no per-field columns needed for v0
create table if not exists public.themes (
  id         text primary key,             -- matches JS theme.id
  child_id   uuid references public.child_profiles(id) on delete cascade not null,
  data       jsonb not null,
  created_at timestamptz default now()
);

-- Full story object (including steps array) stored as JSONB
create table if not exists public.stories (
  id         text primary key,
  child_id   uuid references public.child_profiles(id) on delete cascade not null,
  data       jsonb not null,
  created_at timestamptz default now()
);

-- Session log entries
create table if not exists public.sessions (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid references public.child_profiles(id) on delete cascade not null,
  data       jsonb not null,
  date       timestamptz not null,
  created_at timestamptz default now()
);

-- ── Row-Level Security ────────────────────────────────────────────────────

alter table public.child_profiles enable row level security;
alter table public.themes          enable row level security;
alter table public.stories         enable row level security;
alter table public.sessions        enable row level security;

-- Each parent sees only their own child's data
create policy "own profiles" on public.child_profiles
  for all using (parent_id = auth.uid());

create policy "own themes" on public.themes
  for all using (
    child_id in (select id from public.child_profiles where parent_id = auth.uid())
  );

create policy "own stories" on public.stories
  for all using (
    child_id in (select id from public.child_profiles where parent_id = auth.uid())
  );

create policy "own sessions" on public.sessions
  for all using (
    child_id in (select id from public.child_profiles where parent_id = auth.uid())
  );

-- ── Storage bucket for story images ──────────────────────────────────────

insert into storage.buckets (id, name, public)
  values ('story-images', 'story-images', true)
  on conflict (id) do nothing;

-- Authenticated users can upload (used by permanentizeImages in the browser)
create policy "auth upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'story-images');

-- Anyone can read (images are embedded in the child-facing story reader)
create policy "public read" on storage.objects
  for select using (bucket_id = 'story-images');

-- Authenticated users can delete their own uploads (for story deletion)
create policy "auth delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'story-images');
