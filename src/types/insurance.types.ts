/**
 * Insurance Calculator Types
 * 
 * Defines types for insurance gap calculation based on Chinese market
 * standards and family allocation rules (6:3:1).
 */

import type { UserProfile, InsuranceProfile } from './profile.types';

/**
 * Input for insurance gap calculation
 */
export interface InsuranceCalculatorInput {
  userProfile: UserProfile;
  insuranceProfile: InsuranceProfile;
  mortgageBalance?: number; // Total mortgage balance (not monthly payment)
}

/**
 * Recommended coverage amounts for each insurance type
 */
export interface RecommendedCoverage {
  life: number;
  criticalIllness: number;
  medical: number;
  accident: number;
}

/**
 * Coverage gap for each insurance type
 */
export interface CoverageGap {
  life: number; // Recommended - Existing
  criticalIllness: number;
  medical: number;
  accident: number;
}

/**
 * Priority level for insurance recommendations
 */
export type InsurancePriority = 'high' | 'medium' | 'low';

/**
 * Insurance recommendation with priority
 */
export interface InsuranceRecommendation {
  type: 'medical' | 'accident' | 'criticalIllness' | 'life';
  name: string; // Chinese name
  priority: InsurancePriority;
  recommendedAmount: number;
  existingAmount: number;
  gap: number;
  estimatedPremium: number; // Annual premium estimate
  urgency: string; // Chinese description
}

/**
 * Family allocation breakdown (6:3:1 rule)
 * Primary earner: 60%, Secondary: 30%, Children: 10%
 */
export interface FamilyAllocation {
  primaryEarner: {
    budget: number; // Annual premium budget
    recommendations: InsuranceRecommendation[];
  };
  secondaryEarner?: {
    budget: number;
    recommendations: InsuranceRecommendation[];
  };
  children?: {
    budget: number;
    recommendations: InsuranceRecommendation[];
  };
}

/**
 * Complete insurance gap analysis result
 */
export interface InsuranceGapResult {
  // Recommended coverage amounts
  recommendedCoverage: RecommendedCoverage;
  
  // Existing coverage amounts
  existingCoverage: {
    life: number;
    criticalIllness: number;
    medical: number;
    accident: number;
  };
  
  // Coverage gaps
  gaps: CoverageGap;
  
  // Priority-ranked recommendations
  recommendations: InsuranceRecommendation[];
  
  // Total annual premium budget (5-10% of annual income)
  totalBudget: number;
  
  // Family allocation (if married)
  familyAllocation?: FamilyAllocation;
  
  // Summary statistics
  totalGap: number; // Sum of all gaps
  coverageCompleteness: number; // Percentage (existing / recommended)
  
  // Metadata
  calculatedAt: string;
  assumptions: {
    cityTier: number;
    hasDependents: boolean;
    hasMortgage: boolean;
  };
}

