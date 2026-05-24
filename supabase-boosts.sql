-- Dil Milao — Boosts
-- Run this in Supabase SQL Editor

alter table public.profiles
  add column if not exists boost_credits integer default 0,
  add column if not exists boost_active_until timestamptz;

-- Allow users to read/update their own boost fields (already covered by existing profile policies)
