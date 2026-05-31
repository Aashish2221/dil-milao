-- Dil Milao — Multiple profile photos
-- Run in Supabase SQL Editor

create table if not exists public.profile_photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  photo_url text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.profile_photos enable row level security;

drop policy if exists "Users can manage their own photos" on public.profile_photos;
create policy "Users can manage their own photos"
  on public.profile_photos for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Anyone authenticated can view profile photos" on public.profile_photos;
create policy "Anyone authenticated can view profile photos"
  on public.profile_photos for select
  to authenticated
  using (true);
