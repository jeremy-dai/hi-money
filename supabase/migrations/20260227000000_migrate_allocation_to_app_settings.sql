-- Migration: Consolidate income allocation into app_settings.targetAllocation
--
-- Previously, income allocation targets (the 25-15-50-10 framework) were stored
-- in two places:
--   1. profiles.allocation  (legacy JSONB column)
--   2. profiles.app_settings->>'targetAllocation'  (authoritative, written by Settings page)
--
-- This migration promotes any existing allocation data into app_settings so that
-- settings.targetAllocation becomes the single source of truth, then drops the
-- redundant allocation column.
--
-- Safe to run on live data — no rows are deleted.

--------------------------------------------------------------------------------
-- Step 1: Promote legacy allocation into app_settings.targetAllocation
--         Only updates rows where app_settings does NOT already have targetAllocation
--         (i.e. users who haven't touched the Settings page yet).
--------------------------------------------------------------------------------
update public.profiles
set app_settings = jsonb_set(
  coalesce(app_settings, '{}'::jsonb),
  '{targetAllocation}',
  allocation
)
where
  allocation is not null
  and (app_settings is null or app_settings->>'targetAllocation' is null);

--------------------------------------------------------------------------------
-- Step 2: Ensure every row has a valid targetAllocation (backfill default)
--         Covers newly created profiles that had no allocation and no app_settings.
--------------------------------------------------------------------------------
update public.profiles
set app_settings = jsonb_set(
  coalesce(app_settings, '{}'::jsonb),
  '{targetAllocation}',
  '{"growth":25,"stability":15,"essentials":50,"rewards":10}'::jsonb
)
where app_settings->>'targetAllocation' is null;

--------------------------------------------------------------------------------
-- Step 3: Drop the now-redundant allocation column
--------------------------------------------------------------------------------
alter table public.profiles drop column if exists allocation;
