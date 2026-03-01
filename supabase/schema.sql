
-- Enable UUID extension
create extension if not exists "uuid-ossp";

--------------------------------------------------------------------------------
-- Drop existing tables (safe to re-run; cascades remove dependent objects)
--------------------------------------------------------------------------------
drop table if exists public.insurance_policies cascade;
drop table if exists public.asset_accounts cascade;
drop table if exists public.spending_records cascade;
drop table if exists public.profiles cascade;

--------------------------------------------------------------------------------
-- 1. Profiles Table
--    profile_data JSONB stores the full ProfileData object (minus spending):
--      { monthlyIncome, allocation, accounts, userProfile, policies, settings }
--    This avoids per-column mapping and allows TypeScript types to evolve freely.
--------------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,

  profile_data jsonb default '{}'::jsonb,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

--------------------------------------------------------------------------------
-- 2. Spending Records (kept as separate rows for efficient per-month sync)
--------------------------------------------------------------------------------
create table public.spending_records (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,

  month text not null, -- Format: 'YYYY-MM'
  amount numeric not null default 0,
  note text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique (user_id, month)
);

-- RLS
alter table public.spending_records enable row level security;

create policy "Users can view own spending"
  on public.spending_records for select
  using (auth.uid() = user_id);

create policy "Users can insert own spending"
  on public.spending_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update own spending"
  on public.spending_records for update
  using (auth.uid() = user_id);

create policy "Users can delete own spending"
  on public.spending_records for delete
  using (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 3. LLM Rate Limits (Edge Function abuse prevention)
--------------------------------------------------------------------------------
drop table if exists public.llm_rate_limits cascade;

create table public.llm_rate_limits (
  user_id    uuid references auth.users(id) on delete cascade not null,
  date       date not null default current_date,
  call_count integer not null default 0,
  primary key (user_id, date)
);

-- RLS: service role key (used by Edge Function) bypasses this automatically
alter table public.llm_rate_limits enable row level security;

-- Users can read their own usage; writes are service-role only
create policy "Users can view own llm usage"
  on public.llm_rate_limits for select
  using (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 4. Triggers for Automatic Profile Creation
--------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to allow re-running this script safely
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
