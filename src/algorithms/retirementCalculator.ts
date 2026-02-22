/**
 * Retirement Gap Calculator
 * 
 * Calculates retirement gap based on China's pension replacement rate (43.6%)
 * and withdrawal strategies. Uses 3.5% withdrawal rate and 3% real return.
 */

import type {
  RetirementCalculatorInput,
  RetirementGapResult,
  PensionAnalysis,
  CorpusAnalysis,
  LifestyleScenarioResult,
} from '../types/retirement.types';
import type { UserProfile } from '../types/profile.types';

// Constants
const PENSION_REPLACEMENT_RATE = 0.436; // 43.6% for China
const WITHDRAWAL_RATE = 0.035; // 3.5% annual withdrawal
const REAL_RETURN_RATE = 0.03; // 3% real return (6% return - 3% inflation)
const INFLATION_RATE = 0.03; // 3% inflation
const DESIRED_INCOME_RATIO = 0.7; // 70% of current income

/**
 * Calculate pension analysis
 */
function calculatePension(
  userProfile: UserProfile
): PensionAnalysis {
  const { monthlyIncome, age, retirementAge } = userProfile;

  // Estimate contribution years (assume started working at 22, contributing since then)
  const yearsWorked = Math.max(0, age - 22);
  const yearsToRetirement = Math.max(0, retirementAge - age);
  const contributionYears = Math.min(40, yearsWorked + yearsToRetirement); // Cap at 40 years

  // Estimated pension = monthlyIncome × 43.6% × (contributionYears / 40)
  const baseReplacementRate = PENSION_REPLACEMENT_RATE * (contributionYears / 40);
  const estimatedMonthlyPension = monthlyIncome * baseReplacementRate;
  const actualReplacementRate = baseReplacementRate;

  // Desired income: 70% of current
  const desiredIncome = monthlyIncome * DESIRED_INCOME_RATIO;
  const pensionShortfall = Math.max(0, desiredIncome - estimatedMonthlyPension);

  return {
    estimatedMonthlyPension: Math.round(estimatedMonthlyPension),
    contributionYears,
    replacementRate: Math.round(actualReplacementRate * 1000) / 10, // Percentage with 1 decimal
    pensionShortfall: Math.round(pensionShortfall),
  };
}

/**
 * Calculate future value with compound interest
 */
function futureValue(
  presentValue: number,
  years: number,
  rate: number = REAL_RETURN_RATE
): number {
  return presentValue * Math.pow(1 + rate, years);
}

/**
 * Calculate future value of annuity (monthly contributions)
 */
function futureValueOfAnnuity(
  monthlyPayment: number,
  years: number,
  rate: number = REAL_RETURN_RATE
): number {
  const monthlyRate = Math.pow(1 + rate, 1 / 12) - 1;
  if (monthlyRate === 0) {
    return monthlyPayment * 12 * years;
  }
  return (
    monthlyPayment *
    12 *
    ((Math.pow(1 + rate, years) - 1) / rate)
  );
}

/**
 * Calculate monthly savings needed to reach target
 */
function calculateMonthlySavingsNeeded(
  targetAmount: number,
  currentSavings: number,
  years: number,
  currentMonthlyContribution: number = 0
): number {
  const futureValueCurrent = futureValue(currentSavings, years);
  const futureValueContributions = futureValueOfAnnuity(currentMonthlyContribution, years);
  const totalFutureValue = futureValueCurrent + futureValueContributions;
  const gap = Math.max(0, targetAmount - totalFutureValue);

  if (gap <= 0) {
    return 0; // Already on track
  }

  // Calculate monthly payment needed to close gap
  const monthlyRate = Math.pow(1 + REAL_RETURN_RATE, 1 / 12) - 1;
  const months = years * 12;

  if (monthlyRate === 0) {
    return gap / months;
  }

  // PMT formula: PMT = FV × r / ((1 + r)^n - 1)
  const monthlySavings = (gap * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
  return Math.max(0, Math.round(monthlySavings));
}

/**
 * Calculate corpus analysis
 */
function calculateCorpus(
  userProfile: UserProfile,
  pensionShortfall: number,
  currentSavings: number,
  currentMonthlyContribution: number = 0
): CorpusAnalysis {
  const { age, retirementAge } = userProfile;
  const yearsToRetirement = Math.max(0, retirementAge - age);

  // Required corpus = (shortfall × 12) / withdrawal_rate
  // Using 3.5% withdrawal rate: corpus = annual_shortfall / 0.035 = annual_shortfall × 28.57
  const annualShortfall = pensionShortfall * 12;
  const requiredCorpus = annualShortfall / WITHDRAWAL_RATE;

  // Future value of current savings
  const currentSavingsFutureValue = futureValue(currentSavings, yearsToRetirement);

  // Future value of ongoing contributions
  const contributionsFutureValue = futureValueOfAnnuity(
    currentMonthlyContribution,
    yearsToRetirement
  );

  // Total future value
  const totalFutureValue = currentSavingsFutureValue + contributionsFutureValue;

  // Gap
  const corpusGap = Math.max(0, requiredCorpus - totalFutureValue);

  // Monthly savings needed
  const monthlySavingsNeeded = calculateMonthlySavingsNeeded(
    requiredCorpus,
    currentSavings,
    yearsToRetirement,
    currentMonthlyContribution
  );

  return {
    requiredCorpus: Math.round(requiredCorpus),
    currentSavingsFutureValue: Math.round(currentSavingsFutureValue),
    contributionsFutureValue: Math.round(contributionsFutureValue),
    totalFutureValue: Math.round(totalFutureValue),
    corpusGap: Math.round(corpusGap),
    monthlySavingsNeeded: Math.round(monthlySavingsNeeded),
  };
}

/**
 * Calculate scenario comparisons
 */
function calculateScenarios(
  userProfile: UserProfile,
  yearsToRetirement: number,
  currentSavings: number,
  currentMonthlyContribution: number = 0
): LifestyleScenarioResult[] {
  const { monthlyIncome } = userProfile;

  const scenarios: Array<{ scenario: LifestyleScenarioResult['scenario']; ratio: number }> = [
    { scenario: 'basic', ratio: 0.5 }, // 50% of current income
    { scenario: 'comfortable', ratio: 0.7 }, // 70% of current income
    { scenario: 'affluent', ratio: 1.0 }, // 100% of current income
  ];

  return scenarios.map(({ scenario, ratio }) => {
    const desiredMonthlyIncome = monthlyIncome * ratio;
    // Assume pension covers 43.6% of current income
    const estimatedPension = monthlyIncome * PENSION_REPLACEMENT_RATE;
    const shortfall = Math.max(0, desiredMonthlyIncome - estimatedPension);
    const annualShortfall = shortfall * 12;
    const requiredCorpus = annualShortfall / WITHDRAWAL_RATE;

    const monthlySavingsNeeded = calculateMonthlySavingsNeeded(
      requiredCorpus,
      currentSavings,
      yearsToRetirement,
      currentMonthlyContribution
    );

    // Check if achievable (don't exceed 50% of income for savings)
    const maxAffordableSavings = monthlyIncome * 0.5;
    const isAchievable = monthlySavingsNeeded <= maxAffordableSavings;

    return {
      scenario,
      desiredMonthlyIncome: Math.round(desiredMonthlyIncome),
      requiredCorpus: Math.round(requiredCorpus),
      monthlySavingsNeeded: Math.round(monthlySavingsNeeded),
      isAchievable,
    };
  });
}

/**
 * Generate summary and recommendations
 */
function generateSummary(
  corpusGap: number,
  monthlySavingsNeeded: number,
  monthlyIncome: number
): {
  hasGap: boolean;
  gapSeverity: 'none' | 'small' | 'moderate' | 'large';
  keyMessage: string;
  recommendations: string[];
} {
  const hasGap = corpusGap > 0;
  const savingsRate = (monthlySavingsNeeded / monthlyIncome) * 100;

  let gapSeverity: 'none' | 'small' | 'moderate' | 'large' = 'none';
  if (corpusGap > 0) {
    if (savingsRate < 10) {
      gapSeverity = 'small';
    } else if (savingsRate < 20) {
      gapSeverity = 'moderate';
    } else {
      gapSeverity = 'large';
    }
  }

  const recommendations: string[] = [];
  let keyMessage: string;

  if (!hasGap) {
    return {
      hasGap: false,
      gapSeverity: 'none',
      keyMessage: '恭喜！您的退休规划处于良好状态。',
      recommendations: [
        '继续保持当前的储蓄率',
        '定期审查和调整投资组合',
        '考虑增加投资回报率',
      ],
    };
  }

  if (gapSeverity === 'small') {
    keyMessage = '您的退休准备基本充足，只需小幅调整。';
    recommendations.push(`建议每月额外储蓄 ${Math.round(monthlySavingsNeeded)} 元`);
    recommendations.push('考虑提高投资回报率');
    recommendations.push('延长工作年限可进一步改善');
  } else if (gapSeverity === 'moderate') {
    keyMessage = '您的退休准备存在一定缺口，需要积极规划。';
    recommendations.push(`建议每月储蓄 ${Math.round(monthlySavingsNeeded)} 元（占收入 ${Math.round(savingsRate)}%）`);
    recommendations.push('考虑增加投资比例，提高回报率');
    recommendations.push('评估是否可延长工作年限');
    recommendations.push('考虑降低退休后的生活标准');
  } else {
    keyMessage = '您的退休准备存在较大缺口，需要立即行动。';
    recommendations.push(`急需每月储蓄 ${Math.round(monthlySavingsNeeded)} 元（占收入 ${Math.round(savingsRate)}%）`);
    recommendations.push('大幅提高投资比例和回报率');
    recommendations.push('考虑延长工作年限至 65 岁或更晚');
    recommendations.push('可能需要调整退休后的生活标准');
    recommendations.push('寻求专业理财顾问的建议');
  }

  return {
    hasGap: true,
    gapSeverity,
    keyMessage,
    recommendations,
  };
}

/**
 * Main function: Calculate retirement gap
 */
export function calculateRetirementGap(
  input: RetirementCalculatorInput
): RetirementGapResult {
  const { userProfile, currentSavings, currentMonthlyContribution = 0 } = input;

  const { age, retirementAge, monthlyIncome } = userProfile;
  const yearsToRetirement = Math.max(0, retirementAge - age);

  // Calculate pension
  const pension = calculatePension(userProfile);

  // Desired income
  const desiredMonthlyIncome = monthlyIncome * DESIRED_INCOME_RATIO;

  // Calculate corpus
  const corpus = calculateCorpus(
    userProfile,
    pension.pensionShortfall,
    currentSavings,
    currentMonthlyContribution
  );

  // Calculate scenarios
  const scenarios = calculateScenarios(
    userProfile,
    yearsToRetirement,
    currentSavings,
    currentMonthlyContribution
  );

  // Generate summary
  const summary = generateSummary(
    corpus.corpusGap,
    corpus.monthlySavingsNeeded,
    monthlyIncome
  );

  // Action plan
  const savingsRate = (corpus.monthlySavingsNeeded / monthlyIncome) * 100;
  const isOnTrack = corpus.corpusGap <= 0;

  // Calculate years to close gap if saving at current rate
  let yearsToCloseGap: number | undefined;
  if (!isOnTrack && currentMonthlyContribution > 0) {
    // Simplified calculation: gap / (monthly_contribution * 12 * return_rate)
    const annualGrowth = currentMonthlyContribution * 12 * (1 + REAL_RETURN_RATE);
    if (annualGrowth > 0) {
      yearsToCloseGap = Math.ceil(corpus.corpusGap / annualGrowth);
    }
  }

  const actionPlan = {
    monthlySavingsTarget: corpus.monthlySavingsNeeded,
    annualSavingsTarget: Math.round(corpus.monthlySavingsNeeded * 12),
    savingsRate: Math.round(savingsRate * 10) / 10,
    isOnTrack,
    yearsToCloseGap,
  };

  return {
    currentAge: age,
    retirementAge,
    yearsToRetirement,
    monthlyIncome,
    pension,
    desiredMonthlyIncome: Math.round(desiredMonthlyIncome),
    corpus,
    scenarios,
    actionPlan,
    summary,
    calculatedAt: new Date().toISOString(),
    assumptions: {
      pensionReplacementRate: PENSION_REPLACEMENT_RATE,
      withdrawalRate: WITHDRAWAL_RATE,
      realReturnRate: REAL_RETURN_RATE,
      inflationRate: INFLATION_RATE,
    },
  };
}

