-- Dil Milao — Read receipts
-- Run this in Supabase SQL Editor

-- Add read column to messages table
alter table public.messages
  add column if not exists read boolean default false;

-- Allow receivers to mark messages as read
create policy if not exists "Receiver can mark messages read"
  on public.messages
  for update
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

-- Enable realtime updates on messages (needed for read receipt sync)
-- If not already enabled, run:
-- alter publication supabase_realtime add table public.messages;
