-- Dil Milao — Block filter for Discover
-- Run this AFTER supabase-unmatch.sql

-- Allow the blocked person to also read the block row
-- (so we can filter them out of each other's Discover feed)
drop policy if exists "Users can see their own blocks" on public.blocks;

create policy "Users can see relevant blocks"
  on public.blocks for select
  to authenticated
  using (auth.uid() = blocker_id or auth.uid() = blocked_id);
