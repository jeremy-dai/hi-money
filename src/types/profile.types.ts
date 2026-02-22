/**
 * User Profile Types
 * 
 * Defines the structure for user profiling system that enables
 * personalized financial recommendations based on demographics,
 * financial situation, and goals.
 */

/**
 * City tier classification for China
 * 1 = Tier 1 (Beijing, Shanghai, Guangzhou, Shenzhen)
 * 2 = Tier 2 (Provincial capitals, major cities)
 * 3 = Tier 3 (Prefecture-level cities)
 * 4 = Tier 4 (County-level cities and below)
 */
export type CityTier = 1 | 2 | 3 | 4;

export type MaritalStatus = 'single' | 'married' | 'divorced';

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export type PrimaryGoal = 'retirement' | 'house' | 'education' | 'wealth' | 'security';

/**
 * Main user profile containing demographics, financial situation, and goals
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

  // System
  profileCompleted: boolean;
  lastUpdated: string;
}

/**
 * Insurance profile for gap calculation
 */
export interface InsuranceProfile {
  existingCoverage: {
    medicalInsurance: number;
    lifeInsurance: number;
    criticalIllness: number;
    accidentInsurance: number;
  };
  existingCoverageAmount: {
    life: number;
    criticalIllness: number;
    medical: number;
  };
  dependents: number;
  parentsCare: boolean;
}

/**
 * Retirement profile for gap calculation
 */
export interface RetirementProfile {
  currentPensionContribution: number;
  expectedMonthlyExpense: number;
  desiredLifestyle: 'basic' | 'comfortable' | 'affluent';
  retirementLocation: 'tier1' | 'tier2' | 'tier3' | 'tier4';
}

