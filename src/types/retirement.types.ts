/**
 * Retirement Calculator Types
 * 
 * Defines types for retirement gap calculation based on China's
 * pension replacement rate (43.6%) and withdrawal strategies.
 */

import type { UserProfile, RetirementProfile } from './profile.types';

/**
 * Lifestyle scenario for retirement planning
 */
export type LifestyleScenario = 'basic' | 'comfortable' | 'affluent';

/**
 * Input for retirement gap calculation
 */
export interface RetirementCalculatorInput {
  userProfile: UserProfile;
  retirementProfile: RetirementProfile;
  currentSavings: number; // Current total savings/investments
  currentMonthlyContribution?: number; // Current monthly savings rate
}

/**
 * Pension calculation result
 */
export interface PensionAnalysis {
  estimatedMonthlyPension: number; // Based on 43.6% replacement rate
  contributionYears: number; // Years of pension contributions
  replacementRate: number; // Actual replacement rate (may be < 43.6% if < 40 years)
  pensionShortfall: number; // Desired - Estimated
}

/**
 * Corpus (retirement fund) analysis
 */
export interface CorpusAnalysis {
  requiredCorpus: number; // Total corpus needed at retirement
  currentSavingsFutureValue: number; // Future value of current savings
  contributionsFutureValue: number; // Future value of ongoing contributions
  totalFutureValue: number; // Sum of savings + contributions
  corpusGap: number; // Required - Total
  monthlySavingsNeeded: number; // Additional monthly savings to close gap
}

/**
 * Scenario comparison for different lifestyles
 */
export interface LifestyleScenarioResult {
  scenario: LifestyleScenario;
  desiredMonthlyIncome: number;
  requiredCorpus: number;
  monthlySavingsNeeded: number;
  isAchievable: boolean; // Based on income constraints
}

/**
 * Complete retirement gap analysis result
 */
export interface RetirementGapResult {
  // Basic info
  currentAge: number;
  retirementAge: number;
  yearsToRetirement: number;
  monthlyIncome: number;
  
  // Pension analysis
  pension: PensionAnalysis;
  
  // Desired retirement income
  desiredMonthlyIncome: number; // 70% of current income (recommended)
  
  // Corpus analysis
  corpus: CorpusAnalysis;
  
  // Scenario comparisons
  scenarios: LifestyleScenarioResult[];
  
  // Action plan
  actionPlan: {
    monthlySavingsTarget: number;
    annualSavingsTarget: number;
    savingsRate: number; // Percentage of income
    isOnTrack: boolean;
    yearsToCloseGap?: number; // If saving at current rate
  };
  
  // Summary
  summary: {
    hasGap: boolean;
    gapSeverity: 'none' | 'small' | 'moderate' | 'large';
    keyMessage: string; // Chinese message
    recommendations: string[]; // Chinese recommendations
  };
  
  // Metadata
  calculatedAt: string;
  assumptions: {
    pensionReplacementRate: number; // 43.6%
    withdrawalRate: number; // 3.5%
    realReturnRate: number; // 3% (6% return - 3% inflation)
    inflationRate: number; // 3%
  };
}

