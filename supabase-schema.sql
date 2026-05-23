-- Dil Milao - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Profiles table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  age integer,
  gender text,
  city text,
  bio text,
  photo_url text,
  interests text[],
  is_premium boolean default false,
  premium_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Likes table (who liked who)
create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  from_user_id uuid references public.profiles(id) on delete cascade,
  to_user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(from_user_id, to_user_id)
);

-- Matches table (mutual likes)
create table if not exists public.matches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  matched_user_id uuid references public.profiles(id) on delete cascade,
  matched_at timestamptz default now(),
  unique(user_id, matched_user_id)
);

-- Messages table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security (RLS)

-- Profiles: anyone can view, only owner can update
alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Likes: users can see their own likes
alter table public.likes enable row level security;

create policy "Users can see their sent likes"
  on public.likes for select
  to authenticated
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Users can send likes"
  on public.likes for insert
  to authenticated
  with check (auth.uid() = from_user_id);

-- Matches: users can see their own matches
alter table public.matches enable row level security;

create policy "Users can see their matches"
  on public.matches for select
  to authenticated
  using (auth.uid() = user_id or auth.uid() = matched_user_id);

create policy "Matches can be inserted by system"
  on public.matches for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Messages: users can see messages they sent or received
alter table public.messages enable row level security;

create policy "Users can see their messages"
  on public.messages for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = sender_id);

create policy "Users can update read status of received messages"
  on public.messages for update
  to authenticated
  using (auth.uid() = receiver_id);

-- Function: auto-create match when both users like each other
create or replace function public.handle_mutual_like()
returns trigger as $$
begin
  if exists (
    select 1 from public.likes
    where from_user_id = new.to_user_id
    and to_user_id = new.from_user_id
  ) then
    insert into public.matches (user_id, matched_user_id)
    values (new.from_user_id, new.to_user_id)
    on conflict do nothing;

    insert into public.matches (user_id, matched_user_id)
    values (new.to_user_id, new.from_user_id)
    on conflict do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_like_created
  after insert on public.likes
  for each row execute procedure public.handle_mutual_like();

-- Realtime: enable for messages table
alter publication supabase_realtime add table public.messages;

-- Storage: avatars bucket policies
-- Run these AFTER creating the 'avatars' bucket in Supabase Storage dashboard

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
