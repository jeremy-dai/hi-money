
import { supabase } from '../lib/supabase';
import type { ProfileData, Accounts, UserProfile, InsurancePolicy } from '../types';
import { DEFAULT_ALLOCATION } from '../utils/constants';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const groupAccounts = (rows: any[]): Accounts => {
  const accounts: Accounts = { growth: [], stability: [], special: [] };
  rows.forEach(row => {
    if (row.category === 'growth' || row.category === 'stability' || row.category === 'special') {
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

    // 5. Fetch History
    const { data: historyData } = await supabase
      .from('history_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

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
      history: (historyData || []).map((h: any) => ({
        date: h.date,
        type: h.type,
        totalAmount: h.total_amount,
        snapshot: h.snapshot_data
      })),
      spending: (spendingData || []).map((s: any) => ({
        month: s.month,
        amount: s.amount,
        note: s.note
      })),
      userProfile,
      policies: (policiesData || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        annualPremium: p.annual_premium,
        cashValue: p.cash_value,
        coverageAmount: p.coverage_amount,
        startDate: p.start_date,
        notes: p.notes,
        benefits: p.benefits
      })),
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

    // Note: For arrays (accounts, spending, etc.), full sync is complex.
    // Ideally we should sync individual items on change.
    // For this prototype, we'll assume the store handles granular updates via specific API calls,
    // or we implement a full replace strategy (delete all for user and re-insert) which is risky but simple.
    // Or better: The store should call specific add/update/delete functions.
    
    // We will export granular functions for the store to use.
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

export const addSpending = async (userId: string, record: any) => {
  return supabase.from('spending_records').insert({
    user_id: userId,
    month: record.month,
    amount: record.amount,
    note: record.note
  });
};

export const addPolicy = async (userId: string, policy: InsurancePolicy) => {
  return supabase.from('insurance_policies').insert({
    user_id: userId,
    ...policy, // map fields to snake_case if needed
    annual_premium: policy.annualPremium,
    cash_value: policy.cashValue,
    coverage_amount: policy.coverageAmount,
    start_date: policy.startDate
  });
};
