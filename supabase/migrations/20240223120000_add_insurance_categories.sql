-- Add new columns for insurance categorization
-- Migration created to support new insurance taxonomy features

-- Add category column
ALTER TABLE public.insurance_policies 
ADD COLUMN IF NOT EXISTS category text;

-- Add sub_category column
ALTER TABLE public.insurance_policies 
ADD COLUMN IF NOT EXISTS sub_category text;

-- Add is_tax_advantaged column with default false
ALTER TABLE public.insurance_policies 
ADD COLUMN IF NOT EXISTS is_tax_advantaged boolean DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.insurance_policies.category IS 'High-level category: protection, savings, investment, group';
COMMENT ON COLUMN public.insurance_policies.sub_category IS 'Specific sub-category based on the main category';
COMMENT ON COLUMN public.insurance_policies.is_tax_advantaged IS 'Flag for tax-advantaged policies like HSA or certain life insurance';
