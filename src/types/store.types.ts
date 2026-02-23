import type { UserProfile } from './profile.types';
import type { AllocationRecommendation } from './allocation.types';
import type { InsurancePolicy } from './insurance.types';
import type { WorkspaceSettings } from './settings.types';

// ---------------------------------------------------------------------------
// Workspace mode
// ---------------------------------------------------------------------------
export type WorkspaceMode = 'PERSONAL' | 'EXAMPLE' | 'SANDBOX';

// ---------------------------------------------------------------------------
// Core data primitives
// ---------------------------------------------------------------------------
export type InvestmentCategoryType = 'growth' | 'stability' | 'special';

/** Income allocation targets (the 25-15-50-10 framework) */
export interface Allocation {
  growth: number;
  stability: number;
  essentials: number;
  rewards: number;
}

export interface Account {
  name: string;
  amount: number;
  updatedAt?: string; // ISO date string
}

/** Accounts only hold ASSET categories (no spending categories) */
export interface Accounts {
  growth: Account[];
  stability: Account[];
  special: Account[];
}

/** Monthly spending record */
export interface SpendingRecord {
  month: string;   // "2025-01" format
  amount: number;
  note?: string;
}

// ---------------------------------------------------------------------------
// ProfileData — the unit of isolation per workspace
// ---------------------------------------------------------------------------
export interface ProfileData {
  monthlyIncome: number;
  allocation: Allocation;
  accounts: Accounts;
  spending: SpendingRecord[];
  userProfile: UserProfile | null;
  policies: InsurancePolicy[];
  settings: WorkspaceSettings | null;
}

// ---------------------------------------------------------------------------
// AppState — the full Zustand store shape
// ---------------------------------------------------------------------------
export interface AppState {
  // Workspace
  activeMode: WorkspaceMode;
  activeExampleId: string | null;
  personalData: ProfileData;
  sandboxData: ProfileData | null;
  exampleDataCache: Record<string, ProfileData>;
  isLoadingExample: boolean;
  isAuthenticated: boolean;

  // Getters (read from getCurrentData())
  getCurrentData: () => ProfileData;
  getCategoryTotal: (category: InvestmentCategoryType) => number;
  getTotalAssets: () => number;
  getCategoryPercentage: (category: InvestmentCategoryType) => number;
  getCategoryDeviation: (category: InvestmentCategoryType) => number;
  getTotalCoverage: () => number;
  getRiskLeverageRatio: () => number;
  getMA3Spending: () => number;
  getTargetAllocation: () => Allocation;
  getRecommendedAllocation: () => AllocationRecommendation | null;

  // Workspace actions
  switchMode: (mode: WorkspaceMode, exampleId?: string) => void;
  loadExampleProfile: (exampleId: string) => Promise<void>;
  createSandbox: (base?: Partial<ProfileData>) => void;
  clearSandbox: () => void;
  loadPersonalData: (data: ProfileData) => void;

  // Data mutations
  setMonthlyIncome: (income: number) => void;
  setAllocation: (allocation: Allocation) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  addAccount: (category: InvestmentCategoryType, account: Account) => void;
  updateAccountAmount: (category: InvestmentCategoryType, index: number, amount: number) => void;
  deleteAccount: (category: InvestmentCategoryType, index: number) => void;
  addSpending: (record: SpendingRecord) => void;
  addSpendingBatch: (records: SpendingRecord[]) => void;
  updateSpending: (month: string, updates: Partial<SpendingRecord>) => void;
  deleteSpending: (month: string) => void;
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  addPolicy: (policy: InsurancePolicy) => void;
  updatePolicy: (id: string, updates: Partial<InsurancePolicy>) => void;
  deletePolicy: (id: string) => void;
  updateSettings: (settings: Partial<WorkspaceSettings>) => void;
  resetAll: () => void;
  applyRecommendedAllocation: () => void;
}
