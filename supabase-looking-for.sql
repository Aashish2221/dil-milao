-- Add looking_for preference to profiles
alter table profiles
  add column if not exists looking_for text default 'Everyone';

-- Add religion to profiles
alter table profiles
  add column if not exists religion text;

-- Add state (Indian state) to profiles
alter table profiles
  add column if not exists state text;

-- Add notification preferences to profiles
alter table profiles
  add column if not exists notif_matches boolean default true,
  add column if not exists notif_messages boolean default true,
  add column if not exists notif_likes boolean default true;

-- Add subscription tracking
alter table profiles
  add column if not exists razorpay_subscription_id text,
  add column if not exists subscription_status text default 'none';

-- Add boost credits
alter table profiles
  add column if not exists boost_credits integer default 0;
