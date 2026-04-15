-- Create the fridge_items table in Supabase
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

create table if not exists fridge_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null check (category in ('produce', 'dairy', 'leftovers', 'condiments', 'other')),
  location text not null check (location in ('fridge', 'freezer', 'pantry')),
  added_at timestamptz not null default now(),
  expires_at date
);

-- Enable Row Level Security
alter table fridge_items enable row level security;

-- Allow anonymous read/insert/delete (since this uses the anon key)
create policy "Allow anonymous select" on fridge_items for select using (true);
create policy "Allow anonymous insert" on fridge_items for insert with check (true);
create policy "Allow anonymous delete" on fridge_items for delete using (true);

-- Enable Realtime for this table
alter publication supabase_realtime add table fridge_items;
