export type CityTier = 1 | 2 | 3 | 4;
export type MaritalStatus = 'single' | 'married' | 'divorced';
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';
export type PrimaryGoal = 'retirement' | 'house' | 'education' | 'wealth' | 'security';

/**
 * Unified user profile — merges demographics, financial, goals,
 * insurance context, and retirement context into one object.
 * Insurance/retirement fields are optional (collected later in Assets/Settings).
 */
export interface UserProfile {
  // Demographics
  age: number;
  cityTier: CityTier;
  maritalStatus: MaritalStatus;
  hasChildren: boolean;
  childrenCount: number;
  childrenAges: number[];

  // Financial
  monthlyIncome: number;
  hasMortgage: boolean;
  mortgageMonthly?: number;
  existingDebts: number;

  // Goals
  riskTolerance: RiskTolerance;
  primaryGoal: PrimaryGoal;
  retirementAge: number;

  // Insurance context (merged from old InsuranceProfile — optional)
  dependents?: number;
  parentsCare?: boolean;

  // Retirement context (merged from old RetirementProfile — optional)
  currentPensionContribution?: number;
  expectedMonthlyExpense?: number;
  desiredLifestyle?: 'basic' | 'comfortable' | 'affluent';
  retirementLocation?: 'tier1' | 'tier2' | 'tier3' | 'tier4';

  // System
  profileCompleted: boolean;
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// Legacy types kept for algorithm compatibility
// ---------------------------------------------------------------------------
export interface InsuranceProfile {
  existingCoverage: {
    medicalInsurance: number;
    lifeInsurance: number;
    criticalIllness: number;
    accidentInsurance: number;
  };
  existingCoverageAmount: { life: number; criticalIllness: number; medical: number };
  dependents: number;
  parentsCare: boolean;
}

export interface RetirementProfile {
  currentPensionContribution: number;
  expectedMonthlyExpense: number;
  desiredLifestyle: 'basic' | 'comfortable' | 'affluent';
  retirementLocation: 'tier1' | 'tier2' | 'tier3' | 'tier4';
}
