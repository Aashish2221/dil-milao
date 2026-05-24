-- Dil Milao — Super Like support
-- Run this in Supabase SQL Editor

-- Add super_like column to likes table
alter table public.likes
  add column if not exists super_like boolean default false;
