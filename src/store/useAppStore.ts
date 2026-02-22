import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AppState, CategoryType, Allocation, Accounts, Account, HistoryRecord } from '../types';
import type { UserProfile, InsuranceProfile, RetirementProfile } from '../types/profile.types';
import type { AllocationRecommendation } from '../types/allocation.types';
import type { InsuranceGapResult } from '../types/insurance.types';
import type { RetirementGapResult } from '../types/retirement.types';
import type { DemoScenario } from '../types/visitor.types';
import { DEFAULT_ALLOCATION } from '../utils/constants';
import { calculateRecommendedAllocation } from '../algorithms/recommendAllocation';
import { calculateInsuranceGap } from '../algorithms/insuranceCalculator';
import { calculateRetirementGap } from '../algorithms/retirementCalculator';

const initialState = {
  monthlyIncome: 0,
  allocation: DEFAULT_ALLOCATION,
  isAuthenticated: false,
  accounts: {
    growth: [],
    stability: [],
    special: [], // Added for investment tracking
    essentials: [],
    rewards: [],
  },
  history: [],
  // NEW: Profile state
  userProfile: null as UserProfile | null,
  insuranceProfile: null as InsuranceProfile | null,
  retirementProfile: null as RetirementProfile | null,
  isVisitorMode: false,
  visitorScenario: null as any | null,
};

export const useAppStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Computed getters
      getCategoryTotal: (category: CategoryType) => {
        const accounts = get().accounts[category] || [];
        return accounts.reduce((sum, account) => sum + (account.amount || 0), 0);
      },

      getTotalAssets: () => {
        const { getCategoryTotal } = get();
        // Only count investment categories (Phase 4 will remove essentials/rewards)
        return (
          getCategoryTotal('growth') +
          getCategoryTotal('stability') +
          getCategoryTotal('special')
        );
      },

      getCategoryPercentage: (category: CategoryType) => {
        const { getCategoryTotal, getTotalAssets } = get();
        const total = getTotalAssets();
        if (total === 0) return 0;
        const categoryAmount = getCategoryTotal(category);
        return parseFloat(((categoryAmount / total) * 100).toFixed(1));
      },

      getCategoryDeviation: (category: CategoryType) => {
        const { getCategoryPercentage, allocation } = get();
        const actualPercentage = getCategoryPercentage(category);
        const targetPercentage = allocation[category] || 0;
        return parseFloat((actualPercentage - targetPercentage).toFixed(1));
      },

      // NEW: Profile getters
      getRecommendedAllocation: (): AllocationRecommendation | null => {
        const { userProfile, insuranceProfile } = get();
        if (!userProfile) {
          return null;
        }
        return calculateRecommendedAllocation(userProfile, insuranceProfile || undefined);
      },

      getInsuranceGap: (): InsuranceGapResult | null => {
        const { userProfile, insuranceProfile } = get();
        if (!userProfile || !insuranceProfile) {
          return null;
        }
        try {
          // Calculate mortgage balance from monthly payment if available
          const mortgageBalance = userProfile.hasMortgage && userProfile.mortgageMonthly
            ? userProfile.mortgageMonthly * 12 * 20 // Rough estimate: 20 years
            : undefined;
          
          return calculateInsuranceGap({
            userProfile,
            insuranceProfile,
            mortgageBalance,
          });
        } catch (error) {
          console.error('Error calculating insurance gap:', error);
          return null;
        }
      },

      getRetirementGap: (): RetirementGapResult | null => {
        const { userProfile, retirementProfile, getTotalAssets } = get();
        if (!userProfile || !retirementProfile) {
          return null;
        }
        try {
          const currentSavings = getTotalAssets();
          // Estimate current monthly contribution (could be enhanced with actual tracking)
          const currentMonthlyContribution = userProfile.monthlyIncome * 0.1; // Assume 10% savings rate
          
          return calculateRetirementGap({
            userProfile,
            retirementProfile,
            currentSavings,
            currentMonthlyContribution,
          });
        } catch (error) {
          console.error('Error calculating retirement gap:', error);
          return null;
        }
      },

      // Actions
      setMonthlyIncome: (income: number) => set({ monthlyIncome: income }),

      setAllocation: (allocation: Allocation) => set({ allocation }),

      setAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),

      updateAccounts: (accounts: Accounts) => set({ accounts }),

      addAccount: (category: CategoryType, account: Account) =>
        set((state) => {
          state.accounts[category].push(account);
        }),

      updateAccountAmount: (category: CategoryType, index: number, amount: number) =>
        set((state) => {
          if (state.accounts[category][index]) {
            state.accounts[category][index].amount = amount;
          }
        }),

      deleteAccount: (category: CategoryType, index: number) =>
        set((state) => {
          state.accounts[category].splice(index, 1);
        }),

      addHistory: (type: HistoryRecord['type'], income?: number, allocation?: Allocation) =>
        set((state) => {
          const { getTotalAssets, getCategoryTotal } = get();
          const record: HistoryRecord = {
            date: new Date().toISOString(),
            type,
            totalAmount: getTotalAssets(),
            snapshot: {
              growth: getCategoryTotal('growth'),
              stability: getCategoryTotal('stability'),
              essentials: getCategoryTotal('essentials'),
              rewards: getCategoryTotal('rewards'),
            },
          };
          if (income && income > 0) record.income = income;
          if (allocation) record.allocation = allocation;
          state.history.push(record);
        }),

      resetAll: () => set(initialState),

      // NEW: Profile actions
      setUserProfile: (profile: UserProfile) =>
        set((state) => {
          state.userProfile = profile;
          state.userProfile.lastUpdated = new Date().toISOString();
        }),

      updateUserProfile: (updates: Partial<UserProfile>) =>
        set((state) => {
          if (state.userProfile) {
            state.userProfile = { ...state.userProfile, ...updates };
            state.userProfile.lastUpdated = new Date().toISOString();
          }
        }),

      setInsuranceProfile: (profile: InsuranceProfile) =>
        set({ insuranceProfile: profile }),

      setRetirementProfile: (profile: RetirementProfile) =>
        set({ retirementProfile: profile }),

      applyRecommendedAllocation: () => {
        const { getRecommendedAllocation, setAllocation } = get();
        const recommendation = getRecommendedAllocation();
        if (recommendation) {
          setAllocation(recommendation.finalAllocation);
        }
      },

      activateVisitorMode: (scenario: DemoScenario) =>
        set((state) => {
          state.isVisitorMode = true;
          state.visitorScenario = scenario;
          state.userProfile = scenario.profile;
          state.insuranceProfile = scenario.insuranceProfile || null;
          state.retirementProfile = scenario.retirementProfile || null;
          state.accounts = scenario.mockAccounts;
          state.history = scenario.mockHistory;
          if (scenario.mockAllocation) {
            state.allocation = scenario.mockAllocation;
          }
          if (scenario.mockMonthlyIncome) {
            state.monthlyIncome = scenario.mockMonthlyIncome;
          }
        }),

      deactivateVisitorMode: () =>
        set({
          isVisitorMode: false,
          visitorScenario: null,
        }),
    })),
    {
      name: 'hi-money-storage',
      storage: createJSONStorage(() => localStorage),
      // Exclude visitor mode data from persistence
      partialize: (state) => {
        if (state.isVisitorMode) {
          // Don't persist visitor mode data
          const { isVisitorMode, visitorScenario, ...persisted } = state;
          return persisted;
        }
        return state;
      },
    }
  )
);
