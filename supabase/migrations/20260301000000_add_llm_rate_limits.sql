-- Rate limiting table for LLM Edge Function calls
-- Tracks per-user per-day usage to prevent abuse

create table if not exists public.llm_rate_limits (
  user_id uuid references auth.users(id) on delete cascade not null,
  date    date not null default current_date,
  call_count integer not null default 0,
  primary key (user_id, date)
);

-- Enable RLS (Edge Function uses service role key, which bypasses RLS automatically)
alter table public.llm_rate_limits enable row level security;

-- Allow users to view their own usage (read-only; writes are service-role only)
create policy "Users can view own llm usage"
  on public.llm_rate_limits for select
  using (auth.uid() = user_id);

-- Auto-clean rows older than 7 days to keep the table small
-- (run via pg_cron or a scheduled function; this is just the table definition)
