-- Add looking_for preference to profiles
alter table profiles
  add column if not exists looking_for text default 'Everyone';

-- Add religion to profiles
alter table profiles
  add column if not exists religion text;

-- Add notification preferences to profiles
alter table profiles
  add column if not exists notif_matches boolean default true,
  add column if not exists notif_messages boolean default true,
  add column if not exists notif_likes boolean default true;
