/**
 * Insurance Gap Calculator
 * 
 * Calculates insurance coverage gaps based on Chinese market standards:
 * - Life Insurance: Mortgage + 10 years income + education + elderly care
 * - Critical Illness: 3-5 years of income
 * - Medical: 3M for tier-1 cities, 2M for others
 * - Accident: 5-10x annual income
 * - Budget: 5-10% of annual income
 * - Family Allocation: 6:3:1 (Primary:Secondary:Children)
 */

import type {
  InsuranceCalculatorInput,
  InsuranceGapResult,
  RecommendedCoverage,
  CoverageGap,
  InsuranceRecommendation,
  FamilyAllocation,
} from '../types/insurance.types';
import type { UserProfile } from '../types/profile.types';

/**
 * Calculate recommended insurance coverage amounts
 */
function calculateRecommendedCoverage(
  userProfile: UserProfile,
  mortgageBalance?: number
): RecommendedCoverage {
  const { monthlyIncome, age, cityTier, hasChildren, childrenCount } = userProfile;
  const annualIncome = monthlyIncome * 12;

  // Life Insurance = Mortgage + (10 years income) + (education costs) + (elderly care)
  const mortgageAmount = mortgageBalance || 0;
  const tenYearsIncome = annualIncome * 10;
  const educationCosts = hasChildren ? 500000 * childrenCount : 0;
  const elderlyCare = 200000; // Assume elderly care needed
  const lifeInsurance = mortgageAmount + tenYearsIncome + educationCosts + elderlyCare;

  // Critical Illness = 3-5 years of income (5 years if < 35, 3 years if >= 35)
  const criticalIllnessYears = age < 35 ? 5 : 3;
  const criticalIllness = annualIncome * criticalIllnessYears;

  // Medical = 3M for tier-1 cities, 2M for others
  const medical = cityTier === 1 ? 3000000 : 2000000;

  // Accident = 5-10x annual income (use 7x as average)
  const accident = annualIncome * 7;

  return {
    life: Math.round(lifeInsurance),
    criticalIllness: Math.round(criticalIllness),
    medical: medical,
    accident: Math.round(accident),
  };
}

/**
 * Calculate coverage gaps
 */
function calculateGaps(
  recommended: RecommendedCoverage,
  existing: {
    life: number;
    criticalIllness: number;
    medical: number;
    accident: number;
  }
): CoverageGap {
  return {
    life: Math.max(0, recommended.life - existing.life),
    criticalIllness: Math.max(0, recommended.criticalIllness - existing.criticalIllness),
    medical: Math.max(0, recommended.medical - existing.medical),
    accident: Math.max(0, recommended.accident - existing.accident),
  };
}

/**
 * Determine priority for insurance types (China market context)
 */
function getInsurancePriority(
  type: 'medical' | 'accident' | 'criticalIllness' | 'life',
  userProfile: UserProfile,
): { priority: InsuranceRecommendation['priority']; urgency: string } {
  const { maritalStatus, hasChildren } = userProfile;

  switch (type) {
    case 'medical':
      return {
        priority: 'high',
        urgency: '高优先级 - 百万医疗险是基础保障，建议优先配置',
      };
    case 'accident':
      return {
        priority: 'high',
        urgency: '高优先级 - 意外险成本低、保障高，建议优先配置',
      };
    case 'criticalIllness':
      return {
        priority: maritalStatus === 'married' ? 'high' : 'medium',
        urgency: maritalStatus === 'married'
          ? '高优先级 - 重疾险对家庭保障至关重要'
          : '中优先级 - 建议根据预算逐步配置',
      };
    case 'life':
      return {
        priority: hasChildren ? 'high' : 'low',
        urgency: hasChildren
          ? '高优先级 - 有子女需要保障，建议配置寿险'
          : '低优先级 - 单身人士可暂缓配置',
      };
    default:
      return { priority: 'medium', urgency: '中优先级' };
  }
}

/**
 * Estimate annual premium for insurance type (rough estimates)
 */
function estimatePremium(
  type: 'medical' | 'accident' | 'criticalIllness' | 'life',
  coverageAmount: number,
  age: number
): number {
  // Rough premium estimates (per 100k coverage, varies by age)
  const baseRates: Record<string, number> = {
    medical: 200, // ~200 RMB per year for 1M coverage
    accident: 100, // ~100 RMB per year for 100k coverage
    criticalIllness: age < 30 ? 2000 : age < 40 ? 3000 : 4000, // Per 100k
    life: age < 30 ? 500 : age < 40 ? 800 : 1200, // Per 100k
  };

  const baseRate = baseRates[type] || 1000;
  const units = coverageAmount / 100000;
  return Math.round(baseRate * units);
}

/**
 * Calculate family allocation (6:3:1 rule)
 */
function calculateFamilyAllocation(
  totalBudget: number,
  recommendations: InsuranceRecommendation[],
  userProfile: UserProfile
): FamilyAllocation | undefined {
  if (userProfile.maritalStatus !== 'married') {
    return undefined;
  }

  const primaryBudget = totalBudget * 0.6;
  const secondaryBudget = totalBudget * 0.3;
  const childrenBudget = totalBudget * 0.1;

  // Split recommendations between family members
  // Primary earner gets life + critical illness (if high priority)
  // Secondary gets similar but lower amounts
  // Children get medical + accident
  const primaryRecs = recommendations
    .filter((r) => r.type === 'life' || r.type === 'criticalIllness')
    .map((r) => ({ ...r, estimatedPremium: Math.min(r.estimatedPremium, primaryBudget * 0.7) }));

  const secondaryRecs = recommendations
    .filter((r) => r.type === 'criticalIllness' || r.type === 'medical')
    .map((r) => ({ ...r, estimatedPremium: Math.min(r.estimatedPremium, secondaryBudget * 0.6) }));

  const childrenRecs = recommendations
    .filter((r) => r.type === 'medical' || r.type === 'accident')
    .map((r) => ({ ...r, estimatedPremium: Math.min(r.estimatedPremium, childrenBudget * 0.8) }));

  return {
    primaryEarner: {
      budget: primaryBudget,
      recommendations: primaryRecs,
    },
    secondaryEarner: {
      budget: secondaryBudget,
      recommendations: secondaryRecs,
    },
    children: userProfile.hasChildren
      ? {
          budget: childrenBudget,
          recommendations: childrenRecs,
        }
      : undefined,
  };
}

/**
 * Main function: Calculate insurance gap
 */
export function calculateInsuranceGap(
  input: InsuranceCalculatorInput
): InsuranceGapResult {
  const { userProfile, insuranceProfile, mortgageBalance } = input;

  // Calculate recommended coverage
  const recommended = calculateRecommendedCoverage(userProfile, mortgageBalance);

  // Get existing coverage
  const existing = {
    life: insuranceProfile.existingCoverageAmount.life,
    criticalIllness: insuranceProfile.existingCoverageAmount.criticalIllness,
    medical: insuranceProfile.existingCoverageAmount.medical,
    accident: insuranceProfile.existingCoverage.accidentInsurance,
  };

  // Calculate gaps
  const gaps = calculateGaps(recommended, existing);

  // Create recommendations with priorities
  const recommendations: InsuranceRecommendation[] = [
    {
      type: 'medical' as const,
      name: '百万医疗险',
      recommendedAmount: recommended.medical,
      existingAmount: existing.medical,
      gap: gaps.medical,
      estimatedPremium: estimatePremium('medical', recommended.medical, userProfile.age),
      ...getInsurancePriority('medical', userProfile),
    },
    {
      type: 'accident' as const,
      name: '意外险',
      recommendedAmount: recommended.accident,
      existingAmount: existing.accident,
      gap: gaps.accident,
      estimatedPremium: estimatePremium('accident', recommended.accident, userProfile.age),
      ...getInsurancePriority('accident', userProfile),
    },
    {
      type: 'criticalIllness' as const,
      name: '重疾险',
      recommendedAmount: recommended.criticalIllness,
      existingAmount: existing.criticalIllness,
      gap: gaps.criticalIllness,
      estimatedPremium: estimatePremium('criticalIllness', recommended.criticalIllness, userProfile.age),
      ...getInsurancePriority('criticalIllness', userProfile),
    },
    {
      type: 'life' as const,
      name: '寿险',
      recommendedAmount: recommended.life,
      existingAmount: existing.life,
      gap: gaps.life,
      estimatedPremium: estimatePremium('life', gaps.life, userProfile.age),
      ...getInsurancePriority('life', userProfile),
    },
  ].sort((a, b) => {
    // Sort by priority: high > medium > low
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  // Calculate total budget (7.5% of annual income as average)
  const annualIncome = userProfile.monthlyIncome * 12;
  const totalBudget = annualIncome * 0.075;

  // Calculate family allocation if married
  const familyAllocation = calculateFamilyAllocation(totalBudget, recommendations, userProfile);

  // Calculate total gap
  const totalGap = gaps.life + gaps.criticalIllness + gaps.medical + gaps.accident;

  // Calculate coverage completeness
  const totalRecommended = recommended.life + recommended.criticalIllness + recommended.medical + recommended.accident;
  const totalExisting = existing.life + existing.criticalIllness + existing.medical + existing.accident;
  const coverageCompleteness = totalRecommended > 0 ? (totalExisting / totalRecommended) * 100 : 0;

  return {
    recommendedCoverage: recommended,
    existingCoverage: existing,
    gaps,
    recommendations,
    totalBudget: Math.round(totalBudget),
    familyAllocation,
    totalGap: Math.round(totalGap),
    coverageCompleteness: Math.round(coverageCompleteness * 10) / 10,
    calculatedAt: new Date().toISOString(),
    assumptions: {
      cityTier: userProfile.cityTier,
      hasDependents: userProfile.hasChildren || userProfile.maritalStatus === 'married',
      hasMortgage: userProfile.hasMortgage,
    },
  };
}

