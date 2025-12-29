import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AppState, CategoryType, Allocation, Goal, Accounts, Account, HistoryRecord } from '../types';
import { DEFAULT_ALLOCATION } from '../utils/constants';

const initialState = {
  monthlyIncome: 0,
  allocation: DEFAULT_ALLOCATION,
  hasCompletedSetup: false,
  goal: {
    name: '',
    totalAmount: 0,
    createdAt: '',
  },
  accounts: {
    growth: [],
    stability: [],
    essentials: [],
    rewards: [],
  },
  history: [],
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
        return (
          getCategoryTotal('growth') +
          getCategoryTotal('stability') +
          getCategoryTotal('essentials') +
          getCategoryTotal('rewards')
        );
      },

      getCategoryGoal: (category: CategoryType) => {
        const { goal, allocation } = get();
        const totalGoal = goal.totalAmount || 0;
        const percentage = allocation[category] || 0;
        return (totalGoal * percentage) / 100;
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

      // Actions
      setMonthlyIncome: (income: number) => set({ monthlyIncome: income }),

      setAllocation: (allocation: Allocation) => set({ allocation }),

      completeSetup: () => set({ hasCompletedSetup: true }),

      setGoal: (goal: Goal) => set({ goal }),

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
    })),
    {
      name: 'hi-money-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
