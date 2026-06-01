-- Add last_active column to track user activity
alter table public.profiles
  add column if not exists last_active timestamptz;

-- Index for efficient sorting by recency
create index if not exists profiles_last_active_idx
  on public.profiles (last_active desc nulls last);
