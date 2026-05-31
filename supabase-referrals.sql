-- Dil Milao — Referral System
-- Run in Supabase SQL Editor

-- Add referral code + bonus likes to profiles
alter table public.profiles
  add column if not exists referral_code text unique,
  add column if not exists bonus_likes integer default 0,
  add column if not exists referred_by uuid references public.profiles(id);

-- Auto-generate referral code for new and existing profiles
create or replace function public.generate_referral_code()
returns trigger as $$
begin
  if new.referral_code is null then
    new.referral_code := lower(substring(replace(new.id::text, '-', ''), 1, 8));
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profile_referral_code on public.profiles;
create trigger on_profile_referral_code
  before insert or update on public.profiles
  for each row execute procedure public.generate_referral_code();

-- Backfill existing profiles that have no referral code
update public.profiles
  set referral_code = lower(substring(replace(id::text, '-', ''), 1, 8))
  where referral_code is null;

-- Referrals tracking table
create table if not exists public.referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_id uuid references public.profiles(id) on delete cascade not null,
  referred_id uuid references public.profiles(id) on delete cascade not null unique,
  bonus_credited boolean default false,
  created_at timestamptz default now()
);

alter table public.referrals enable row level security;

drop policy if exists "Users can see their own referrals" on public.referrals;
create policy "Users can see their own referrals"
  on public.referrals for select
  to authenticated
  using (auth.uid() = referrer_id);

drop policy if exists "System can insert referrals" on public.referrals;
create policy "System can insert referrals"
  on public.referrals for insert
  to authenticated
  with check (true);

drop policy if exists "System can update referrals" on public.referrals;
create policy "System can update referrals"
  on public.referrals for update
  to authenticated
  using (true);

-- RPC: safely increment bonus_likes for a user
create or replace function public.increment_bonus_likes(uid uuid, amount integer)
returns void as $$
begin
  update public.profiles
    set bonus_likes = coalesce(bonus_likes, 0) + amount
    where id = uid;
end;
$$ language plpgsql security definer;
