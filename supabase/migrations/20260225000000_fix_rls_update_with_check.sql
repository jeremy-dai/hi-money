-- Migration: Fix RLS UPDATE policies to include WITH CHECK
-- Prevents users from reassigning records to other users via UPDATE.
-- Safe to run on existing data — no table drops or data changes.

--------------------------------------------------------------------------------
-- asset_accounts
--------------------------------------------------------------------------------
drop policy if exists "Users can update own accounts" on public.asset_accounts;

create policy "Users can update own accounts"
  on public.asset_accounts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- spending_records
--------------------------------------------------------------------------------
drop policy if exists "Users can update own spending" on public.spending_records;

create policy "Users can update own spending"
  on public.spending_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- insurance_policies
--------------------------------------------------------------------------------
drop policy if exists "Users can update own policies" on public.insurance_policies;

create policy "Users can update own policies"
  on public.insurance_policies for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
