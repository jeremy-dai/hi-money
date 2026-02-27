
-- Enable UUID extension
create extension if not exists "uuid-ossp";

--------------------------------------------------------------------------------
-- Drop existing tables (safe to re-run; cascades remove dependent objects)
--------------------------------------------------------------------------------
drop table if exists public.insurance_policies cascade;
drop table if exists public.spending_records cascade;
drop table if exists public.asset_accounts cascade;
drop table if exists public.profiles cascade;

--------------------------------------------------------------------------------
-- 1. Profiles Table (Merges UserProfile + Settings)
--------------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  
  -- Core Financial Data
  monthly_income numeric default 0,
  
  -- JSONB for structured data to match plan flexibility
  demographics jsonb default '{}'::jsonb,      -- age, cityTier, maritalStatus, etc.
  financial_goals jsonb default '{}'::jsonb,   -- riskTolerance, retirementAge, primaryGoal, etc.
  app_settings jsonb default '{"targetAllocation":{"growth":25,"stability":15,"essentials":50,"rewards":10},"subCategories":[]}'::jsonb,  -- workspace settings; targetAllocation is the 25-15-50-10 income split
  
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
-- 2. Asset Accounts (Growth, Stability, Special)
--------------------------------------------------------------------------------
create table public.asset_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,

  category text not null check (category in ('growth', 'stability', 'special', 'emergency')),
  name text not null,
  balance numeric default 0,
  institution text,
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.asset_accounts enable row level security;

create policy "Users can view own accounts" 
  on public.asset_accounts for select 
  using (auth.uid() = user_id);

create policy "Users can insert own accounts" 
  on public.asset_accounts for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own accounts"
  on public.asset_accounts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own accounts" 
  on public.asset_accounts for delete 
  using (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 3. Spending Records (Monthly tracking)
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
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own spending" 
  on public.spending_records for delete 
  using (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 4. Insurance Policies
--------------------------------------------------------------------------------
create table public.insurance_policies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  name text not null,
  type text, -- Legacy field, kept for compatibility
  category text, -- New category: protection, savings, investment, group
  sub_category text, -- New subcategory
  is_tax_advantaged boolean default false,
  annual_premium numeric default 0,
  cash_value numeric default 0,
  coverage_amount numeric default 0,
  start_date date,
  cash_value_schedule jsonb,  -- Year-by-year cash value: [{year, amount}]
  premium_schedule jsonb,     -- Year-by-year premium: [{year, amount}]
  coverage_schedule jsonb,    -- Year-by-year coverage: [{year, amount}]
  benefits jsonb default '{}'::jsonb, -- Flexible key-value pairs for benefits
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.insurance_policies enable row level security;

create policy "Users can view own policies" 
  on public.insurance_policies for select 
  using (auth.uid() = user_id);

create policy "Users can insert own policies" 
  on public.insurance_policies for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own policies"
  on public.insurance_policies for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own policies" 
  on public.insurance_policies for delete 
  using (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 5. [Removed] History Snapshots (Deprecated)
--------------------------------------------------------------------------------
-- Table removed as part of simplified architecture.
-- Was: create table public.history_snapshots (...);

--------------------------------------------------------------------------------
-- 6. Triggers for Automatic Profile Creation
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
