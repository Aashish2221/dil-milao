-- Dil Milao — Payments table
-- Run this in Supabase SQL Editor

create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan text not null,
  amount integer not null,           -- in INR (₹199, ₹399, etc.)
  razorpay_order_id text,
  razorpay_payment_id text unique,   -- unique prevents replay attacks
  status text default 'success',
  created_at timestamptz default now()
);

alter table public.payments enable row level security;

create policy "Users can see their own payments"
  on public.payments for select
  to authenticated
  using (auth.uid() = user_id);

create policy "System can insert payments"
  on public.payments for insert
  to authenticated
  with check (auth.uid() = user_id);
