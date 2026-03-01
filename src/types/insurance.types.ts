/**
 * Insurance Types
 *
 * InsurancePolicy: per-policy record with triple-dispatch
 * (annualPremium → spending, cashValue → assets, coverageAmount → risk leverage)
 */

/**
 * Insurance Categories & Subcategories
 */
export type InsuranceCategory = 'protection' | 'savings' | 'investment';

export type InsuranceSubCategory =
  // Protection (保障型)
  | 'criticalIllness' | 'medical' | 'accident' | 'termLife' | 'cancer'
  // Savings (储蓄型)
  | 'increasingWholeLife' | 'pensionAnnuity' | 'educationAnnuity' | 'endowment' | 'wholeLife'
  // Investment (投资型)
  | 'participating' | 'universalLife' | 'unitLinked';

/**
 * Individual insurance policy with triple-dispatch values
 */
export interface InsurancePolicy {
  id: string;
  name: string;
  category?: InsuranceCategory;
  subCategory?: InsuranceSubCategory;
  isTaxAdvantaged?: boolean;
  annualPremium: number;
  cashValue: number;
  coverageAmount: number;
  startDate: string;
  endDate?: string; // Policy maturity date
  cashValueSchedule?: { year: number; amount: number }[];
  premiumSchedule?: { year: number; amount: number }[];
  coverageSchedule?: { year: number; amount: number }[];
  notes?: string;
  benefits: Record<string, string>;
}

// Legacy gap-analysis types kept for algorithm compatibility
import type { UserProfile, InsuranceProfile } from './profile.types';

export interface InsuranceCalculatorInput {
  userProfile: UserProfile;
  insuranceProfile: InsuranceProfile;
  mortgageBalance?: number;
}

export interface RecommendedCoverage {
  life: number; criticalIllness: number; medical: number; accident: number;
}

export interface CoverageGap {
  life: number; criticalIllness: number; medical: number; accident: number;
}

export type InsurancePriority = 'high' | 'medium' | 'low';

export interface InsuranceRecommendation {
  type: 'medical' | 'accident' | 'criticalIllness' | 'life';
  name: string; priority: InsurancePriority;
  recommendedAmount: number; existingAmount: number; gap: number;
  estimatedPremium: number; urgency: string;
}

export interface FamilyAllocation {
  primaryEarner: { budget: number; recommendations: InsuranceRecommendation[] };
  secondaryEarner?: { budget: number; recommendations: InsuranceRecommendation[] };
  children?: { budget: number; recommendations: InsuranceRecommendation[] };
}

export interface InsuranceGapResult {
  recommendedCoverage: RecommendedCoverage;
  existingCoverage: { life: number; criticalIllness: number; medical: number; accident: number };
  gaps: CoverageGap;
  recommendations: InsuranceRecommendation[];
  totalBudget: number;
  familyAllocation?: FamilyAllocation;
  totalGap: number;
  coverageCompleteness: number;
  calculatedAt: string;
  assumptions: { cityTier: number; hasDependents: boolean; hasMortgage: boolean };
}
