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

drop policy if exists "Users can file reports" on public.reports;
create policy "Users can file reports"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

drop policy if exists "Users can see their own reports" on public.reports;
create policy "Users can see their own reports"
  on public.reports for select
  to authenticated
  using (auth.uid() = reporter_id);

-- Add resolved column for admin workflow
alter table public.reports
  add column if not exists resolved boolean default false;

-- Admin can read all reports
drop policy if exists "Admin can read all reports" on public.reports;
create policy "Admin can read all reports"
  on public.reports for select
  to authenticated
  using (
    auth.uid() in (
      select id from public.profiles where email = 'aashishpatil2221@gmail.com'
    )
  );

drop policy if exists "Admin can update reports" on public.reports;
create policy "Admin can update reports"
  on public.reports for update
  to authenticated
  using (
    auth.uid() in (
      select id from public.profiles where email = 'aashishpatil2221@gmail.com'
    )
  );

drop policy if exists "Admin can delete reports" on public.reports;
create policy "Admin can delete reports"
  on public.reports for delete
  to authenticated
  using (
    auth.uid() in (
      select id from public.profiles where email = 'aashishpatil2221@gmail.com'
    )
  );
