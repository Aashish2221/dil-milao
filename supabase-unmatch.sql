-- Dil Milao — Unmatch + Block
-- Run this in Supabase SQL Editor

-- ── Allow users to delete match rows (both directions) ────────────────────
create policy "Users can delete their matches"
  on public.matches for delete
  to authenticated
  using (auth.uid() = user_id or auth.uid() = matched_user_id);

-- ── Allow either party to delete messages in their conversation ───────────
create policy "Users can delete their messages"
  on public.messages for delete
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- ── Blocks table ──────────────────────────────────────────────────────────
create table if not exists public.blocks (
  id uuid default gen_random_uuid() primary key,
  blocker_id uuid references public.profiles(id) on delete cascade not null,
  blocked_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(blocker_id, blocked_id)
);

alter table public.blocks enable row level security;

create policy "Users can see their own blocks"
  on public.blocks for select
  to authenticated
  using (auth.uid() = blocker_id);

create policy "Users can block others"
  on public.blocks for insert
  to authenticated
  with check (auth.uid() = blocker_id);

create policy "Users can unblock"
  on public.blocks for delete
  to authenticated
  using (auth.uid() = blocker_id);
