-- Dil Milao — Notifications System
-- Run this in Supabase SQL Editor (after supabase-schema.sql)

-- Notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('message', 'match', 'like')),
  from_user_id uuid references public.profiles(id) on delete cascade,
  from_name text,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table public.notifications enable row level security;

create policy "Users can see their own notifications"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "System can insert notifications"
  on public.notifications for insert
  to authenticated
  with check (true);

create policy "Users can mark their notifications read"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own notifications"
  on public.notifications for delete
  to authenticated
  using (auth.uid() = user_id);

-- Enable realtime so the bell updates live
alter publication supabase_realtime add table public.notifications;

-- ─── Trigger: new message → notify receiver ───────────────────────────────
-- Only fires once per unread conversation (no spam when messages come fast)
create or replace function public.handle_new_message_notification()
returns trigger as $$
declare
  sender_name text;
  existing_unread integer;
begin
  -- Don't spam: skip if there's already an unread message notification from this sender
  select count(*) into existing_unread
  from public.notifications
  where user_id = new.receiver_id
    and type = 'message'
    and from_user_id = new.sender_id
    and read = false;

  if existing_unread = 0 then
    select full_name into sender_name from public.profiles where id = new.sender_id;
    insert into public.notifications (user_id, type, from_user_id, from_name, message)
    values (
      new.receiver_id,
      'message',
      new.sender_id,
      sender_name,
      sender_name || ' sent you a message'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_message_for_notification on public.messages;
create trigger on_message_for_notification
  after insert on public.messages
  for each row execute procedure public.handle_new_message_notification();

-- ─── Trigger: new match → notify both users ──────────────────────────────
-- The mutual-like trigger already creates two match rows (A→B and B→A),
-- so this fires once per user — which is exactly what we want.
create or replace function public.handle_new_match_notification()
returns trigger as $$
declare
  other_name text;
begin
  select full_name into other_name from public.profiles where id = new.matched_user_id;
  insert into public.notifications (user_id, type, from_user_id, from_name, message)
  values (
    new.user_id,
    'match',
    new.matched_user_id,
    other_name,
    'You matched with ' || other_name || '! Say hello 👋'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_match_for_notification on public.matches;
create trigger on_match_for_notification
  after insert on public.matches
  for each row execute procedure public.handle_new_match_notification();

-- ─── Trigger: new like → notify recipient (anonymous for free users) ─────
create or replace function public.handle_new_like_notification()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, from_user_id, message)
  values (
    new.to_user_id,
    'like',
    new.from_user_id,
    'Someone liked your profile ❤️'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_like_for_notification on public.likes;
create trigger on_like_for_notification
  after insert on public.likes
  for each row execute procedure public.handle_new_like_notification();
