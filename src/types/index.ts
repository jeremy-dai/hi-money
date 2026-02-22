export type {
  CategoryType,
  InvestmentCategoryType,
  EducationCategoryType,
  Allocation,
  InvestmentAllocation,
  Account,
  Accounts,
  HistoryRecord,
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

export type {
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

export { calculateFinalAllocation } from './allocation.types';
