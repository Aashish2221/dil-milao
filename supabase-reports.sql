-- Dil Milao — User reports
-- Run this in Supabase SQL Editor

create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.profiles(id) on delete cascade,
  reported_id uuid references public.profiles(id) on delete cascade,
  reason text not null,
  created_at timestamptz default now(),
  unique(reporter_id, reported_id)
);

alter table public.reports enable row level security;

create policy "Users can file reports"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

create policy "Users can see their own reports"
  on public.reports for select
  to authenticated
  using (auth.uid() = reporter_id);
