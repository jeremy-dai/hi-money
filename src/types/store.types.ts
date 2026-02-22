// Investment categories (tracked on dashboard)
export type InvestmentCategoryType = 'growth' | 'stability' | 'special';

// Education framework categories (for welcome/detail pages)
export type EducationCategoryType = 'growth' | 'stability' | 'essentials' | 'rewards';

// All categories combined
export type CategoryType = InvestmentCategoryType | EducationCategoryType;

// Investment allocation (dashboard tracking)
export interface InvestmentAllocation {
  growth: number;
  stability: number;
  special: number;
}

// Allocation - includes all 5 categories (set unused ones to 0)
export interface Allocation {
  growth: number;
  stability: number;
  special: number; // For investment tracking (0 if not used)
  essentials: number; // For education framework (0 if not used)
  rewards: number; // For education framework (0 if not used)
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

// Investment accounts (dashboard)
export interface InvestmentAccounts {
  growth: Account[];
  stability: Account[];
  special: Account[];
}

// Combined structure (includes all categories for flexibility)
export interface Accounts {
  growth: Account[];
  stability: Account[];
  special: Account[];
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

// Import profile types (using type-only import to avoid circular dependency)
import type { UserProfile, InsuranceProfile, RetirementProfile } from './profile.types';
import type { AllocationRecommendation } from './allocation.types';
import type { DemoScenario } from './visitor.types';
import type { InsuranceGapResult } from './insurance.types';
import type { RetirementGapResult } from './retirement.types';

export interface AppState {
  // State
  monthlyIncome: number;
  allocation: Allocation;
  isAuthenticated: boolean; // Whether user is logged in (enables AI features)
  accounts: Accounts;
  history: HistoryRecord[];

  // NEW: Profile state
  userProfile: UserProfile | null;
  insuranceProfile: InsuranceProfile | null;
  retirementProfile: RetirementProfile | null;
  isVisitorMode: boolean;
  visitorScenario: DemoScenario | null;

  // Computed getters
  getCategoryTotal: (category: CategoryType) => number;
  getTotalAssets: () => number;
  getCategoryGoal: (category: CategoryType) => number;
  getCategoryPercentage: (category: CategoryType) => number;
  getCategoryDeviation: (category: CategoryType) => number;

  // NEW: Profile getters
  getRecommendedAllocation: () => AllocationRecommendation | null;
  getInsuranceGap: () => InsuranceGapResult | null;
  getRetirementGap: () => RetirementGapResult | null;

  // Actions
  setMonthlyIncome: (income: number) => void;
  setAllocation: (allocation: Allocation) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  updateAccounts: (accounts: Accounts) => void;
  addAccount: (category: CategoryType, account: Account) => void;
  updateAccountAmount: (category: CategoryType, index: number, amount: number) => void;
  deleteAccount: (category: CategoryType, index: number) => void;
  addHistory: (type: HistoryRecord['type'], income?: number, allocation?: Allocation) => void;
  resetAll: () => void;

  // NEW: Profile actions
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  setInsuranceProfile: (profile: InsuranceProfile) => void;
  setRetirementProfile: (profile: RetirementProfile) => void;
  applyRecommendedAllocation: () => void;
  activateVisitorMode: (scenario: DemoScenario) => void;
  deactivateVisitorMode: () => void;
}
