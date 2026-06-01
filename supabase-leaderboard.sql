-- Dil Milao — Referral Leaderboard
-- Run in Supabase SQL Editor

create or replace function public.get_referral_leaderboard()
returns table(
  user_id uuid,
  full_name text,
  photo_url text,
  referral_count bigint,
  bonus_likes integer
) as $$
  select
    p.id as user_id,
    p.full_name,
    p.photo_url,
    count(r.id) as referral_count,
    p.bonus_likes
  from public.profiles p
  inner join public.referrals r on r.referrer_id = p.id
  group by p.id, p.full_name, p.photo_url, p.bonus_likes
  order by referral_count desc
  limit 20;
$$ language sql security definer;
