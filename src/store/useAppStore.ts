
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  AppState,
  WorkspaceMode,
  Allocation,
  Account,
  SpendingRecord,
  ProfileData,
  InvestmentCategoryType,
} from '../types';
import type { UserProfile } from '../types/profile.types';
import type { InsurancePolicy } from '../types/insurance.types';
import type { WorkspaceSettings } from '../types/settings.types';
import { DEFAULT_ALLOCATION } from '../utils/constants';
import { calculateRecommendedAllocation } from '../algorithms/recommendAllocation';
import { saveProfileData } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { EXAMPLE_PROFILES } from '../data/exampleProfiles';
import { calculateCurrentCashValue } from '../lib/utils';
import { getCashValueByAssetCategory } from '../algorithms/insuranceDispatch';
import type { InvestmentPoolAllocation } from '../types/allocation.types';

// Helper to get total coverage from policies
const getTotalCoverage = (policies: InsurancePolicy[]) => {
  return policies.reduce((sum, p) => sum + (p.coverageAmount || 0), 0);
};

const createEmptyProfile = (): ProfileData => ({
  monthlyIncome: 0,
  allocation: { ...DEFAULT_ALLOCATION },
  accounts: { growth: [], stability: [], special: [], emergency: [] },
  spending: [],
  userProfile: null,
  policies: [],
  settings: null,
});

/** Returns the mutable data slice for the given mode, or null if read-only */
function getMutableSlice(
  state: { activeMode: WorkspaceMode; personalData: ProfileData; sandboxData: ProfileData | null },
  mode: WorkspaceMode
): ProfileData | null {
  if (mode === 'EXAMPLE') return null;
  return mode === 'PERSONAL' ? state.personalData : state.sandboxData;
}

// Sync helper
const syncProfile = async (data: ProfileData) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    saveProfileData(session.user.id, data);
  }
};

export const useAppStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      activeMode: 'PERSONAL' as WorkspaceMode,
      activeExampleId: null as string | null,
      personalData: createEmptyProfile(),
      sandboxData: null as ProfileData | null,
      isAuthenticated: false,

      // -----------------------------------------------------------------------
      // Core getter — all reads go through this
      // -----------------------------------------------------------------------
      getCurrentData: (): ProfileData => {
        const { activeMode, activeExampleId, personalData, sandboxData } = get();

        if (activeMode === 'EXAMPLE' && activeExampleId) {
          return EXAMPLE_PROFILES[activeExampleId] ?? personalData;
        } else if (activeMode === 'SANDBOX' && sandboxData) {
          return sandboxData;
        }

        return personalData;
      },

      // -----------------------------------------------------------------------
      // Derived getters
      // -----------------------------------------------------------------------
      getCategoryTotal: (category: InvestmentCategoryType) => {
        const { accounts, policies } = get().getCurrentData();
        const accountTotal = (accounts[category] || []).reduce((sum, a) => sum + (a.amount || 0), 0);
        const insuranceCashValue = getCashValueByAssetCategory(policies)[category];
        return accountTotal + insuranceCashValue;
      },

      getTotalAssets: () => {
        const { getCategoryTotal } = get();
        return (
          getCategoryTotal('growth') +
          getCategoryTotal('stability') +
          getCategoryTotal('special') +
          getCategoryTotal('emergency')
        );
      },

      getCategoryPercentage: (category: InvestmentCategoryType) => {
        const { getCategoryTotal, getTotalAssets } = get();
        const total = getTotalAssets();
        if (total === 0) return 0;
        return parseFloat(((getCategoryTotal(category) / total) * 100).toFixed(1));
      },

      getCategoryDeviation: (category: InvestmentCategoryType) => {
        // Emergency has no fixed % target; deviation is always 0
        if (category === 'emergency') return 0;
        const { getCategoryPercentage, getInvestmentTargets, getRecommendedAllocation } = get();
        const actual = getCategoryPercentage(category);
        const userTargets = getInvestmentTargets();
        const recommended = getRecommendedAllocation();
        const targets = userTargets
          ?? (recommended ? recommended.investmentAllocation : { growth: 60, stability: 30, special: 10 });
        return parseFloat((actual - (targets[category] ?? 0)).toFixed(1));
      },

      getTargetAllocation: (): Allocation => {
        const settings = get().getCurrentData().settings;
        return settings?.targetAllocation ?? { ...DEFAULT_ALLOCATION };
      },

      getTotalCoverage: () => {
        return getTotalCoverage(get().getCurrentData().policies);
      },

      getRiskLeverageRatio: () => {
        const { getCurrentData, getTotalCoverage: getTC } = get();
        const coverage = getTC();
        const spending = getCurrentData().spending;
        // Simple calculation based on monthly income if no spending data
        const annualSpending = spending.length > 0
          ? (spending.reduce((sum, s) => sum + s.amount, 0) / spending.length) * 12
          : getCurrentData().monthlyIncome * 0.5 * 12; // Assume 50% spending rate

        if (annualSpending === 0) return 0;
        return parseFloat((coverage / annualSpending).toFixed(1));
      },

      getMA3Spending: () => {
        // Simple MA3 implementation if algorithm not available
        const spending = get().getCurrentData().spending;
        if (spending.length < 3) return 0;
        const last3 = spending.slice(-3);
        return last3.reduce((sum, s) => sum + s.amount, 0) / 3;
      },

      getRecommendedAllocation: () => {
        const userProfile = get().getCurrentData().userProfile;
        if (!userProfile) return null;
        return calculateRecommendedAllocation(userProfile);
      },

      getInvestmentTargets: (): InvestmentPoolAllocation | null => {
        const settings = get().getCurrentData().settings;
        return settings?.investmentTargets ?? null;
      },

      // -----------------------------------------------------------------------
      // Workspace actions
      // -----------------------------------------------------------------------
      switchMode: (mode: WorkspaceMode, exampleId?: string) => {
        set((state) => {
          state.activeMode = mode;
          state.activeExampleId = exampleId ?? null;
        });
      },

      // Example profiles are now bundled locally; this is a no-op kept for API compatibility.
      loadExampleProfile: (_exampleId: string) => {},

      createSandbox: (base?: Partial<ProfileData>) =>
        set((state) => {
          const baseData = base ?? get().getCurrentData();
          // Deep clone to ensure isolation
          state.sandboxData = JSON.parse(JSON.stringify({ ...createEmptyProfile(), ...baseData }));
          state.activeMode = 'SANDBOX';
          state.activeExampleId = null;
        }),

      clearSandbox: () =>
        set((state) => {
          state.sandboxData = null;
          state.activeMode = 'PERSONAL';
        }),

      loadPersonalData: (data: ProfileData) =>
        set((state) => {
          state.personalData = data;
          state.activeMode = 'PERSONAL';
        }),

      // -----------------------------------------------------------------------
      // Data mutations
      // -----------------------------------------------------------------------
      setMonthlyIncome: (income: number) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (data) data.monthlyIncome = income;
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      setAllocation: (allocation: Allocation) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (data) data.allocation = allocation;
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      setAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),

      addAccount: (category: InvestmentCategoryType, account: Account) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (data) {
             data.accounts[category].push({
               ...account,
               updatedAt: new Date().toISOString(),
             });
          }
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      updateAccountAmount: (category: InvestmentCategoryType, index: number, amount: number) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (data && data.accounts[category][index]) {
            data.accounts[category][index].amount = amount;
            data.accounts[category][index].updatedAt = new Date().toISOString();
          }
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      deleteAccount: (category: InvestmentCategoryType, index: number) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (data) data.accounts[category].splice(index, 1);
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      addSpending: (record: SpendingRecord) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (!data) return;
          const idx = data.spending.findIndex((s) => s.month === record.month);
          if (idx >= 0) {
            data.spending[idx] = record;
          } else {
            data.spending.push(record);
            data.spending.sort((a, b) => a.month.localeCompare(b.month));
          }
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      addSpendingBatch: (records: SpendingRecord[]) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (!data) return;

          records.forEach((record) => {
            const idx = data.spending.findIndex((s) => s.month === record.month);
            if (idx >= 0) {
              data.spending[idx] = record;
            } else {
              data.spending.push(record);
            }
          });

          data.spending.sort((a, b) => a.month.localeCompare(b.month));
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      updateSpending: (month: string, updates: Partial<SpendingRecord>) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (!data) return;
          const idx = data.spending.findIndex((s) => s.month === month);
          if (idx >= 0) data.spending[idx] = { ...data.spending[idx], ...updates };
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      deleteSpending: (month: string) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (!data) return;
          data.spending = data.spending.filter((s) => s.month !== month);
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      setUserProfile: (profile: UserProfile) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (!data) return;
          data.userProfile = { ...profile, lastUpdated: new Date().toISOString() };
          data.monthlyIncome = profile.monthlyIncome;
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      updateUserProfile: (updates: Partial<UserProfile>) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (!data || !data.userProfile) return;
          data.userProfile = {
            ...data.userProfile,
            ...updates,
            lastUpdated: new Date().toISOString(),
          };
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      addPolicy: (policy: InsurancePolicy) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (data) data.policies.push(policy);
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      updatePolicy: (id: string, updates: Partial<InsurancePolicy>) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (!data) return;
          const idx = data.policies.findIndex((p) => p.id === id);
          if (idx >= 0) data.policies[idx] = { ...data.policies[idx], ...updates };
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      deletePolicy: (id: string) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (!data) return;
          data.policies = data.policies.filter((p) => p.id !== id);
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      refreshPolicies: () => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (!data) return;

          data.policies.forEach((policy) => {
            if (policy.cashValueSchedule && policy.cashValueSchedule.length > 0 && policy.startDate) {
              const newVal = calculateCurrentCashValue(policy.startDate, policy.cashValueSchedule);
              if (policy.cashValue !== newVal) {
                policy.cashValue = newVal;
              }
            }
          });
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      updateSettings: (settings: Partial<WorkspaceSettings>) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (data) {
             data.settings = { ...(data.settings || { targetAllocation: DEFAULT_ALLOCATION, subCategories: [] }), ...settings };
          }
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      setInvestmentTargets: (targets: InvestmentPoolAllocation | null) => {
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (!data) return;
          if (!data.settings) {
            data.settings = { targetAllocation: DEFAULT_ALLOCATION, subCategories: [] };
          }
          data.settings.investmentTargets = targets;
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },

      resetAll: () => {
        set((state) => {
          state.personalData = createEmptyProfile();
          state.sandboxData = null;
          state.activeMode = 'PERSONAL';
          state.activeExampleId = null;
        });
      },

      applyRecommendedAllocation: () => {
        const recommendation = get().getRecommendedAllocation();
        if (!recommendation) return;
        set((state) => {
          const data = getMutableSlice(state, state.activeMode);
          if (data) data.allocation = recommendation.finalAllocation;
        });
        if (get().activeMode === 'PERSONAL') syncProfile(get().personalData);
      },
    })),
    {
      name: 'hi-money-storage',
      partialize: (state) => ({
        activeMode: state.activeMode,
        personalData: state.personalData,
        sandboxData: state.sandboxData,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
