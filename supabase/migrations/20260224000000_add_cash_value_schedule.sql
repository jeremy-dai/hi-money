-- Add cash_value_schedule column for insurance policies
ALTER TABLE public.insurance_policies 
ADD COLUMN IF NOT EXISTS cash_value_schedule jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.insurance_policies.cash_value_schedule IS 'Array of {year, amount} objects defining the cash value progression';
