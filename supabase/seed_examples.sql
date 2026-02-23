-- Seed data for 3 example personas: Fresh Graduate, Mid-Career Family, High Net Worth
-- Includes Profiles, Assets, Spending, and Insurance Policies
-- Usage: Run this in your Supabase SQL Editor

BEGIN;

-- Ensure auth.users exists (for local development or if not already created)
-- Note: In production Supabase, you usually create users via Auth API, but for seeding we insert directly.
-- We use a dummy password hash.

-- ---------------------------------------------------------------------------
-- 1. Fresh Graduate (Young Single)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_user_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Create User in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    'graduate@example.com',
    '$2a$10$abcdefghijklmnopqrstuv', -- Dummy password hash
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "年轻单身白领"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;

  -- Create/Update Profile (Use UPSERT to handle potential trigger creation)
  INSERT INTO public.profiles (
    id, email, full_name, monthly_income, allocation, demographics, financial_goals, app_settings
  ) VALUES (
    v_user_id,
    'graduate@example.com',
    '年轻单身白领',
    15000,
    '{"growth": 25, "stability": 15, "special": 10}'::jsonb,
    '{"age": 25, "cityTier": 1, "maritalStatus": "single"}'::jsonb,
    '{"primaryGoal": "wealth", "riskTolerance": "aggressive"}'::jsonb,
    '{"mode": "case"}'::jsonb
  ) ON CONFLICT (id) DO UPDATE SET
    monthly_income = EXCLUDED.monthly_income,
    allocation = EXCLUDED.allocation,
    demographics = EXCLUDED.demographics,
    financial_goals = EXCLUDED.financial_goals,
    app_settings = EXCLUDED.app_settings;

  -- Assets (Growth)
  INSERT INTO public.asset_accounts (user_id, category, name, balance, institution) VALUES
    (v_user_id, 'growth', '支付宝基金账户', 35000, 'Ant Fortune'),
    (v_user_id, 'growth', '华泰证券账户', 20000, 'Huatai Securities');

  -- Assets (Stability)
  INSERT INTO public.asset_accounts (user_id, category, name, balance, institution) VALUES
    (v_user_id, 'stability', '招商银行储蓄', 15000, 'CMB');

  -- Spending Records (Last 3 months)
  INSERT INTO public.spending_records (user_id, month, amount, note) VALUES
    (v_user_id, '2024-01', 4000, '房租 (合租)'),
    (v_user_id, '2024-01', 3000, '餐饮美食'),
    (v_user_id, '2024-01', 500, '交通通勤'),
    (v_user_id, '2024-01', 1500, '娱乐购物'),
    (v_user_id, '2024-02', 4000, '房租 (合租)'),
    (v_user_id, '2024-02', 2800, '餐饮美食'),
    (v_user_id, '2024-02', 600, '交通通勤'),
    (v_user_id, '2024-03', 4000, '房租 (合租)'),
    (v_user_id, '2024-03', 3200, '餐饮美食');

  -- Insurance Policies (Minimal for young single)
  INSERT INTO public.insurance_policies (user_id, name, type, category, sub_category, is_tax_advantaged, annual_premium, cash_value, coverage_amount, benefits) VALUES
    (v_user_id, '百万医疗险', 'medical', 'protection', 'medical', false, 360, 0, 3000000, '{"deductible": 10000}'::jsonb),
    (v_user_id, '综合意外险', 'accident', 'protection', 'accident', false, 200, 0, 500000, '{"disability": 500000}'::jsonb);

  -- History Snapshots (Removed)
END $$;

-- ---------------------------------------------------------------------------
-- 2. Mid-Career Family (35yo, Married, 1 Kid)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_user_id uuid := '00000000-0000-0000-0000-000000000002';
BEGIN
  -- Create User in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    'family@example.com',
    '$2a$10$abcdefghijklmnopqrstuv',
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "中产二胎家庭"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;

  -- Create/Update Profile
  INSERT INTO public.profiles (
    id, email, full_name, monthly_income, allocation, demographics, financial_goals, app_settings
  ) VALUES (
    v_user_id,
    'family@example.com',
    '中产二胎家庭',
    35000,
    '{"growth": 40, "stability": 40, "special": 20}'::jsonb,
    '{"age": 35, "cityTier": 2, "maritalStatus": "married", "childrenCount": 1}'::jsonb,
    '{"primaryGoal": "education", "riskTolerance": "moderate"}'::jsonb,
    '{"mode": "case"}'::jsonb
  ) ON CONFLICT (id) DO UPDATE SET
    monthly_income = EXCLUDED.monthly_income,
    allocation = EXCLUDED.allocation,
    demographics = EXCLUDED.demographics,
    financial_goals = EXCLUDED.financial_goals,
    app_settings = EXCLUDED.app_settings;

  -- Assets
  INSERT INTO public.asset_accounts (user_id, category, name, balance, institution) VALUES
    (v_user_id, 'growth', '股票账户', 150000, 'Huatai'),
    (v_user_id, 'growth', '指数基金定投', 80000, 'Ant Fortune'),
    (v_user_id, 'stability', '家庭备用金', 100000, 'CMB'),
    (v_user_id, 'stability', '大额存单', 200000, 'ICBC'),
    (v_user_id, 'special', '子女教育金', 50000, 'Education Acc');

  -- Spending Records
  INSERT INTO public.spending_records (user_id, month, amount, note) VALUES
    (v_user_id, '2024-01', 8000, '房贷月供'),
    (v_user_id, '2024-01', 5000, '家庭餐饮与日用'),
    (v_user_id, '2024-01', 3000, '子女教育培训'),
    (v_user_id, '2024-01', 2000, '车辆养护与交通'),
    (v_user_id, '2024-02', 8000, '房贷月供'),
    (v_user_id, '2024-02', 4500, '家庭餐饮与日用'),
    (v_user_id, '2024-02', 3000, '子女教育培训');

  -- Insurance Policies (Standard family coverage)
  INSERT INTO public.insurance_policies (user_id, name, type, category, sub_category, is_tax_advantaged, annual_premium, cash_value, coverage_amount, benefits) VALUES
    (v_user_id, '定期寿险 (夫)', 'life', 'protection', 'termLife', false, 2000, 0, 2000000, '{"term": "20 years"}'::jsonb),
    (v_user_id, '重疾险 (夫)', 'critical_illness', 'protection', 'criticalIllness', false, 6000, 20000, 500000, '{"term": "lifetime"}'::jsonb),
    (v_user_id, '少儿医保+医疗', 'medical', 'protection', 'medical', false, 500, 0, 2000000, '{"insured": "child"}'::jsonb);

  -- History Snapshots (Removed)
END $$;

-- ---------------------------------------------------------------------------
-- 3. High Net Worth (45yo, Business Owner)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_user_id uuid := '00000000-0000-0000-0000-000000000003';
BEGIN
  -- Create User in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    'vip@example.com',
    '$2a$10$abcdefghijklmnopqrstuv',
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "高净值企业家"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;

  -- Create/Update Profile
  INSERT INTO public.profiles (
    id, email, full_name, monthly_income, allocation, demographics, financial_goals, app_settings
  ) VALUES (
    v_user_id,
    'vip@example.com',
    '高净值企业家',
    120000,
    '{"growth": 60, "stability": 30, "special": 10}'::jsonb,
    '{"age": 45, "cityTier": 1, "maritalStatus": "married", "childrenCount": 2}'::jsonb,
    '{"primaryGoal": "wealth", "riskTolerance": "conservative"}'::jsonb,
    '{"mode": "case"}'::jsonb
  ) ON CONFLICT (id) DO UPDATE SET
    monthly_income = EXCLUDED.monthly_income,
    allocation = EXCLUDED.allocation,
    demographics = EXCLUDED.demographics,
    financial_goals = EXCLUDED.financial_goals,
    app_settings = EXCLUDED.app_settings;

  -- Assets
  INSERT INTO public.asset_accounts (user_id, category, name, balance, institution) VALUES
    (v_user_id, 'growth', '私募股权基金', 2000000, 'Private Equity'),
    (v_user_id, 'growth', '美股账户', 1500000, 'Interactive Brokers'),
    (v_user_id, 'stability', '信托理财', 3000000, 'Trust'),
    (v_user_id, 'stability', '现金等价物', 500000, 'Bank'),
    (v_user_id, 'special', '家族传承基金', 1000000, 'Family Office');

  -- Spending Records
  INSERT INTO public.spending_records (user_id, month, amount, note) VALUES
    (v_user_id, '2024-01', 15000, '房产维护与物业'),
    (v_user_id, '2024-01', 30000, '子女国际教育'),
    (v_user_id, '2024-01', 20000, '高端生活方式'),
    (v_user_id, '2024-01', 10000, '家政与司机服务'),
    (v_user_id, '2024-02', 15000, '房产维护与物业'),
    (v_user_id, '2024-02', 25000, '高端生活方式');

  -- Insurance Policies (High value)
  INSERT INTO public.insurance_policies (user_id, name, type, category, sub_category, is_tax_advantaged, annual_premium, cash_value, coverage_amount, benefits) VALUES
    (v_user_id, '终身寿险信托', 'life', 'savings', 'wholeLife', false, 100000, 500000, 10000000, '{"beneficiary": "trust"}'::jsonb),
    (v_user_id, '高端医疗险 (全球)', 'medical', 'protection', 'medical', false, 20000, 0, 50000000, '{"region": "global"}'::jsonb),
    (v_user_id, '养老年金险', 'annuity', 'savings', 'pensionAnnuity', false, 50000, 200000, 0, '{"payout_start_age": 60}'::jsonb);

  -- History Snapshots (Removed)
END $$;

COMMIT;
