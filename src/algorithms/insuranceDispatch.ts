import type { InsurancePolicy } from '../types/insurance.types';
import type { InvestmentCategoryType } from '../types/store.types';

/**
 * Maps an insurance policy's cash value to an investment asset category.
 * - savings (储蓄型) → stability (保本升值)
 * - investment: unitLinked → growth (market-linked); participating/universalLife → stability
 * - protection → null (cash value is negligible / not an investment asset)
 */
export function getAssetCategory(policy: InsurancePolicy): InvestmentCategoryType | null {
  if (policy.category === 'savings') return 'stability';
  if (policy.category === 'investment') {
    return policy.subCategory === 'unitLinked' ? 'growth' : 'stability';
  }
  return null;
}

/** Aggregates insurance cash values by investment category */
export function getCashValueByAssetCategory(
  policies: InsurancePolicy[]
): Record<InvestmentCategoryType, number> {
  const result: Record<InvestmentCategoryType, number> = { growth: 0, stability: 0, special: 0, emergency: 0 };
  for (const p of policies) {
    const cat = getAssetCategory(p);
    if (cat && p.cashValue > 0) {
      result[cat] += p.cashValue;
    }
  }
  return result;
}

/** Returns policies with cash value, grouped by their investment asset category */
export function getPoliciesByAssetCategory(
  policies: InsurancePolicy[]
): Record<InvestmentCategoryType, InsurancePolicy[]> {
  const result: Record<InvestmentCategoryType, InsurancePolicy[]> = { growth: [], stability: [], special: [], emergency: [] };
  for (const p of policies) {
    const cat = getAssetCategory(p);
    if (cat && p.cashValue > 0) {
      result[cat].push(p);
    }
  }
  return result;
}

/** Total annual premiums across all policies → flows into spending view */
export function getTotalAnnualPremiums(policies: InsurancePolicy[]): number {
  return policies.reduce((sum, p) => sum + (p.annualPremium || 0), 0);
}

/** Total cash value across all policies → flows into net assets (stability) */
export function getTotalCashValue(policies: InsurancePolicy[]): number {
  return policies.reduce((sum, p) => sum + (p.cashValue || 0), 0);
}

/** Total coverage across all policies → used for risk leverage ratio */
export function getTotalCoverage(policies: InsurancePolicy[]): number {
  return policies.reduce((sum, p) => sum + (p.coverageAmount || 0), 0);
}

/**
 * Risk leverage ratio = total coverage / annual spending
 * "How many years of spending does your insurance cover?"
 * Target: 10x or more
 */
export function getRiskLeverageRatio(
  policies: InsurancePolicy[],
  annualSpending: number
): number {
  if (annualSpending <= 0) return 0;
  return parseFloat((getTotalCoverage(policies) / annualSpending).toFixed(1));
}

/** Monthly premium cost (annualPremium / 12) for budget display */
export function getMonthlyPremiumCost(policies: InsurancePolicy[]): number {
  return Math.round(getTotalAnnualPremiums(policies) / 12);
}
