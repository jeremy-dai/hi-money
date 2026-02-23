import type { InsurancePolicy } from '../types/insurance.types';

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
