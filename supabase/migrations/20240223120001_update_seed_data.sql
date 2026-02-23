-- Data Migration: Update Insurance Policies for Seed Users
-- This script safely updates the insurance policies for the 3 example personas
-- to include the new categorization fields (category, sub_category, is_tax_advantaged).
-- It deletes existing policies for these specific users to avoid duplicates before re-inserting.

BEGIN;

DO $$
DECLARE
  v_user_1 uuid := '00000000-0000-0000-0000-000000000001'; -- Fresh Graduate
  v_user_2 uuid := '00000000-0000-0000-0000-000000000002'; -- Mid-Career Family
  v_user_3 uuid := '00000000-0000-0000-0000-000000000003'; -- High Net Worth
BEGIN
  -- 1. Remove existing policies for these seed users
  DELETE FROM public.insurance_policies WHERE user_id IN (v_user_1, v_user_2, v_user_3);

  -- 2. Re-insert Fresh Graduate Policies
  INSERT INTO public.insurance_policies (user_id, name, type, category, sub_category, is_tax_advantaged, annual_premium, cash_value, coverage_amount, benefits) VALUES
    (v_user_1, '百万医疗险', 'medical', 'protection', 'medical', false, 360, 0, 3000000, '{"deductible": 10000}'::jsonb),
    (v_user_1, '综合意外险', 'accident', 'protection', 'accident', false, 200, 0, 500000, '{"disability": 500000}'::jsonb);

  -- 3. Re-insert Mid-Career Family Policies
  INSERT INTO public.insurance_policies (user_id, name, type, category, sub_category, is_tax_advantaged, annual_premium, cash_value, coverage_amount, benefits) VALUES
    (v_user_2, '定期寿险 (夫)', 'life', 'protection', 'termLife', false, 2000, 0, 2000000, '{"term": "20 years"}'::jsonb),
    (v_user_2, '重疾险 (夫)', 'critical_illness', 'protection', 'criticalIllness', false, 6000, 20000, 500000, '{"term": "lifetime"}'::jsonb),
    (v_user_2, '少儿医保+医疗', 'medical', 'protection', 'medical', false, 500, 0, 2000000, '{"insured": "child"}'::jsonb);

  -- 4. Re-insert High Net Worth Policies
  INSERT INTO public.insurance_policies (user_id, name, type, category, sub_category, is_tax_advantaged, annual_premium, cash_value, coverage_amount, benefits) VALUES
    (v_user_3, '终身寿险信托', 'life', 'savings', 'wholeLife', false, 100000, 500000, 10000000, '{"beneficiary": "trust"}'::jsonb),
    (v_user_3, '高端医疗险 (全球)', 'medical', 'protection', 'medical', false, 20000, 0, 50000000, '{"region": "global"}'::jsonb),
    (v_user_3, '养老年金险', 'annuity', 'savings', 'pensionAnnuity', false, 50000, 200000, 0, '{"payout_start_age": 60}'::jsonb);

END $$;

COMMIT;
