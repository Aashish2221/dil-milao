-- Add looking_for preference to profiles
alter table profiles
  add column if not exists looking_for text default 'Everyone';
