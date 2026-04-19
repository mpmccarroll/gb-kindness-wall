-- ============================================================
-- GB Kindness Wall — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Main messages table
create table kindness_messages (
  id uuid default uuid_generate_v4() primary key,
  author_name text not null,
  author_grade text not null check (author_grade in ('K','1','2','3','4','5','6')),
  recipient_name text not null,
  recipient_role text not null check (recipient_role in ('student','teacher','staff','parent')),
  recipient_grade text check (recipient_grade in ('K','1','2','3','4','5','6') or recipient_grade is null),
  message text not null,
  status text not null default 'approved' check (status in ('approved','pending','rejected')),
  category text not null check (category in ('K','1','2','3','4','5','6','school','parents')),
  moderation_reason text,
  created_at timestamp with time zone default now()
);

-- Index for fast lookups by category + status (the main query pattern)
create index idx_messages_category_status on kindness_messages (category, status, created_at desc);

-- Index for admin view of pending messages
create index idx_messages_pending on kindness_messages (status, created_at desc) where status = 'pending';

-- Row Level Security
alter table kindness_messages enable row level security;

-- Policy: Anyone can read approved messages
create policy "Public can read approved messages"
  on kindness_messages for select
  using (status = 'approved');

-- Policy: Anyone can insert (the API handles moderation)
create policy "Public can insert messages"
  on kindness_messages for insert
  with check (true);

-- Policy: Service role can do everything (for admin operations)
-- (The service role key bypasses RLS by default, so this is implicit)

-- Optional: Grant anon role access
grant select, insert on kindness_messages to anon;
grant usage on schema public to anon;
