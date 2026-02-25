
import { supabase } from '../lib/supabase';
import type { ProfileData, Accounts, UserProfile, InsurancePolicy, SpendingRecord } from '../types';
import { DEFAULT_ALLOCATION } from '../utils/constants';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const normalizePolicy = (p: any): InsurancePolicy => ({
  id: p.id,
  name: p.name,
  type: p.type,
  category: p.category as any,
  subCategory: p.sub_category as any,
  isTaxAdvantaged: p.is_tax_advantaged,
  annualPremium: p.annual_premium,
  cashValue: p.cash_value,
  coverageAmount: p.coverage_amount,
  startDate: p.start_date,
  cashValueSchedule: p.cash_value_schedule,
  premiumSchedule: p.premium_schedule,
  coverageSchedule: p.coverage_schedule,
  notes: p.notes,
  benefits: p.benefits || {}
});

const groupAccounts = (rows: any[]): Accounts => {
  const accounts: Accounts = { growth: [], stability: [], special: [], emergency: [] };
  rows.forEach(row => {
    if (row.category === 'growth' || row.category === 'stability' || row.category === 'special' || row.category === 'emergency') {
      const category = row.category as keyof Accounts;
      accounts[category].push({ 
        name: row.name, 
        amount: row.balance, 
        // @ts-ignore: Account type might not include institution/notes yet
        institution: row.institution, 
        notes: row.notes 
      });
    }
  });
  return accounts;
};

// ---------------------------------------------------------------------------
// Core Sync Functions
// ---------------------------------------------------------------------------

export const fetchProfileData = async (userId: string): Promise<ProfileData | null> => {
  try {
    // 1. Fetch Profile (Income, Allocation, UserProfile parts)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Profile doesn't exist yet
        return null;
      }
      throw profileError;
    }

    // 2. Fetch Accounts
    const { data: accountsData } = await supabase
      .from('asset_accounts')
      .select('*')
      .eq('user_id', userId);

    // 3. Fetch Spending
    const { data: spendingData } = await supabase
      .from('spending_records')
      .select('*')
      .eq('user_id', userId);

    // 4. Fetch Policies
    const { data: policiesData } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('user_id', userId);

    // Reconstruct ProfileData
    const userProfile: UserProfile = {
      ...profile.demographics,
      ...profile.financial_goals,
      monthlyIncome: profile.monthly_income,
      // Map other fields if needed, or store them in demographics/financial_goals
      // For now assume jsonb structure matches closely or we need default values
      profileCompleted: true,
      lastUpdated: profile.updated_at,
    };

    return {
      monthlyIncome: profile.monthly_income || 0,
      allocation: profile.allocation || DEFAULT_ALLOCATION,
      accounts: groupAccounts(accountsData || []),
      spending: (spendingData || []).map((s: any) => ({
        month: s.month,
        amount: s.amount,
        note: s.note
      })),
      userProfile,
      policies: (policiesData || []).map(normalizePolicy),
      settings: profile.app_settings || null,
    };
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return null;
  }
};

export const saveProfileData = async (userId: string, data: ProfileData) => {
  try {
    // 1. Upsert Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        monthly_income: data.monthlyIncome,
        allocation: data.allocation,
        demographics: {
          age: data.userProfile?.age,
          cityTier: data.userProfile?.cityTier,
          maritalStatus: data.userProfile?.maritalStatus,
          hasChildren: data.userProfile?.hasChildren,
          childrenCount: data.userProfile?.childrenCount,
          childrenAges: data.userProfile?.childrenAges,
        },
        financial_goals: {
          riskTolerance: data.userProfile?.riskTolerance,
          primaryGoal: data.userProfile?.primaryGoal,
          retirementAge: data.userProfile?.retirementAge,
          hasMortgage: data.userProfile?.hasMortgage,
          mortgageMonthly: data.userProfile?.mortgageMonthly,
          existingDebts: data.userProfile?.existingDebts,
          dependents: data.userProfile?.dependents,
          parentsCare: data.userProfile?.parentsCare,
          currentPensionContribution: data.userProfile?.currentPensionContribution,
          expectedMonthlyExpense: data.userProfile?.expectedMonthlyExpense,
          desiredLifestyle: data.userProfile?.desiredLifestyle,
          retirementLocation: data.userProfile?.retirementLocation,
        },
        app_settings: data.settings,
        updated_at: new Date().toISOString(),
      });

    if (profileError) throw profileError;

    // Sync Policies (Full Replace Strategy)
    if (data.policies) {
      // 1. Delete all policies for this user
      await supabase.from('insurance_policies').delete().eq('user_id', userId);
      
      // 2. Insert all policies from state
      if (data.policies.length > 0) {
        const policiesToInsert = data.policies.map(p => ({
            user_id: userId,
            name: p.name,
            type: p.type,
            category: p.category,
            sub_category: p.subCategory,
            is_tax_advantaged: p.isTaxAdvantaged,
            annual_premium: p.annualPremium,
            cash_value: p.cashValue,
            coverage_amount: p.coverageAmount,
            start_date: p.startDate,
            cash_value_schedule: p.cashValueSchedule,
            premium_schedule: p.premiumSchedule,
            coverage_schedule: p.coverageSchedule,
            notes: p.notes,
            benefits: p.benefits
        }));
        
        const { error: insertError } = await supabase
          .from('insurance_policies')
          .insert(policiesToInsert);
          
        if (insertError) {
           console.error('Error syncing policies:', insertError);
           // Don't throw to avoid blocking profile save? Or throw?
           // throwing might be better to alert user, but here we just log
        }
      }
    }

    // Sync Accounts (Full Replace Strategy)
    await supabase.from('asset_accounts').delete().eq('user_id', userId);
    const accountRows = (Object.keys(data.accounts) as (keyof Accounts)[]).flatMap(category =>
      data.accounts[category].map(account => ({
        user_id: userId,
        category,
        name: account.name,
        balance: account.amount,
      }))
    );
    if (accountRows.length > 0) {
      const { error: accountsError } = await supabase.from('asset_accounts').insert(accountRows);
      if (accountsError) console.error('Error syncing accounts:', accountsError);
    }
  } catch (error) {
    console.error('Error saving profile data:', error);
  }
};

// Granular updates
export const addAccount = async (userId: string, account: any, category: string) => {
  return supabase.from('asset_accounts').insert({
    user_id: userId,
    category,
    name: account.name,
    balance: account.amount,
    institution: account.institution,
    notes: account.notes
  });
};

export const updateAccount = async (_userId: string, _accountId: string, _updates: unknown) => {
    // Implementation depends on having account IDs in the store.
    // Current store uses array index. This is a mismatch.
    // We might need to fetch all and match by name or add IDs to Account type.
    // For now, let's skip deep sync implementation and focus on Profile level.
};

export const upsertSpendingRecord = async (userId: string, record: SpendingRecord) => {
  return supabase.from('spending_records').upsert({
    user_id: userId,
    month: record.month,
    amount: record.amount,
    note: record.note
  }, { onConflict: 'user_id,month' });
};

export const deleteSpendingRecord = async (userId: string, month: string) => {
  return supabase.from('spending_records').delete()
    .eq('user_id', userId)
    .eq('month', month);
};

export const addPolicy = async (userId: string, policy: InsurancePolicy) => {
  // If ID is temporary (starts with pol_), let DB generate a UUID
  const id = policy.id.startsWith('pol_') ? undefined : policy.id;
  
  return supabase.from('insurance_policies').insert({
    ...(id ? { id } : {}),
    user_id: userId,
    name: policy.name,
    type: policy.type,
    category: policy.category,
    sub_category: policy.subCategory,
    is_tax_advantaged: policy.isTaxAdvantaged,
    annual_premium: policy.annualPremium,
    cash_value: policy.cashValue,
    coverage_amount: policy.coverageAmount,
    start_date: policy.startDate,
    notes: policy.notes,
    benefits: policy.benefits
  }).select().single();
};

export const updatePolicy = async (policy: InsurancePolicy) => {
  return supabase.from('insurance_policies').update({
    name: policy.name,
    type: policy.type,
    category: policy.category,
    sub_category: policy.subCategory,
    is_tax_advantaged: policy.isTaxAdvantaged,
    annual_premium: policy.annualPremium,
    cash_value: policy.cashValue,
    coverage_amount: policy.coverageAmount,
    start_date: policy.startDate,
    notes: policy.notes,
    benefits: policy.benefits,
    updated_at: new Date().toISOString()
  }).eq('id', policy.id);
};

export const deletePolicy = async (id: string) => {
  return supabase.from('insurance_policies').delete().eq('id', id);
};
