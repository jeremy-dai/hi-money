export type CategoryType = 'growth' | 'stability' | 'essentials' | 'rewards';

export interface Allocation {
  growth: number;
  stability: number;
  essentials: number;
  rewards: number;
}

export interface Goal {
  name: string;
  totalAmount: number;
  createdAt: string;
}

export interface Account {
  name: string;
  amount: number;
}

export interface Accounts {
  growth: Account[];
  stability: Account[];
  essentials: Account[];
  rewards: Account[];
}

export interface HistoryRecord {
  date: string;
  type: 'initial' | 'income' | 'update';
  totalAmount: number;
  snapshot: {
    growth: number;
    stability: number;
    essentials: number;
    rewards: number;
  };
  income?: number;
  allocation?: Allocation;
}

export interface AppState {
  // State
  monthlyIncome: number;
  allocation: Allocation;
  hasCompletedSetup: boolean;
  goal: Goal;
  accounts: Accounts;
  history: HistoryRecord[];

  // Computed getters
  getCategoryTotal: (category: CategoryType) => number;
  getTotalAssets: () => number;
  getCategoryGoal: (category: CategoryType) => number;
  getCategoryPercentage: (category: CategoryType) => number;
  getCategoryDeviation: (category: CategoryType) => number;

  // Actions
  setMonthlyIncome: (income: number) => void;
  setAllocation: (allocation: Allocation) => void;
  completeSetup: () => void;
  setGoal: (goal: Goal) => void;
  updateAccounts: (accounts: Accounts) => void;
  addAccount: (category: CategoryType, account: Account) => void;
  updateAccountAmount: (category: CategoryType, index: number, amount: number) => void;
  deleteAccount: (category: CategoryType, index: number) => void;
  addHistory: (type: HistoryRecord['type'], income?: number, allocation?: Allocation) => void;
  resetAll: () => void;
}
