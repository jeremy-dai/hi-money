export type {
  WorkspaceMode,
  InvestmentCategoryType,
  Allocation,
  Account,
  Accounts,
  SpendingRecord,
  HistoryRecord,
  ProfileData,
  AppState,
} from './store.types';

export type {
  CityTier,
  MaritalStatus,
  RiskTolerance,
  PrimaryGoal,
  UserProfile,
  InsuranceProfile,
  RetirementProfile,
} from './profile.types';

export type {
  IncomeAllocation,
  InvestmentPoolAllocation,
  AllocationRecommendation,
} from './allocation.types';

export { calculateFinalAllocation } from './allocation.types';

export type {
  InsurancePolicy,
  InsuranceCalculatorInput,
  InsuranceGapResult,
  RecommendedCoverage,
  CoverageGap,
  InsuranceRecommendation,
  FamilyAllocation,
} from './insurance.types';

export type {
  RetirementCalculatorInput,
  RetirementGapResult,
  PensionAnalysis,
  CorpusAnalysis,
  LifestyleScenarioResult,
  LifestyleScenario,
} from './retirement.types';

export type {
  SubCategory,
  WorkspaceSettings,
} from './settings.types';

export { DEFAULT_SETTINGS } from './settings.types';
