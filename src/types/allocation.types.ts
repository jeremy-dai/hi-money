/**
 * Allocation Types
 * 
 * Defines the unified allocation system with two layers:
 * - Layer 1: Income Allocation (how to split monthly salary)
 * - Layer 2: Investment Allocation (how to split investment pool)
 */

import type { Allocation } from './store.types';

/**
 * Layer 1: Income Allocation
 * How to split monthly income into major categories
 */
export interface IncomeAllocation {
  // Investment Pool (40-50% of income)
  // This gets further split in Layer 2
  investmentPool: number; // Percentage of income
  
  // Essentials (40-50% of income) - SPENT, not tracked
  essentials: number; // Percentage of income
  
  // Rewards (5-10% of income) - SPENT, not tracked
  rewards: number; // Percentage of income
}

/**
 * Layer 2: Investment Pool Allocation
 * How to split the investment pool into investment categories
 * (Percentages of the investment pool, not total income)
 */
export interface InvestmentPoolAllocation {
  growth: number; // Percentage of investment pool
  stability: number; // Percentage of investment pool
  special: number; // Percentage of investment pool
}

/**
 * Unified Allocation Recommendation
 * Combines both layers into a single recommendation
 */
export interface AllocationRecommendation {
  // Layer 1: Income split
  incomeAllocation: IncomeAllocation;
  
  // Layer 2: Investment split (percentages of investment pool)
  investmentAllocation: InvestmentPoolAllocation;
  
  // Final percentages of total income (for display)
  // This is what gets stored in the Allocation type
  finalAllocation: Allocation;
  
  // Explanation/rationale for the recommendation
  rationale: {
    factors: Array<{
      name: string;
      impact: string;
      weight: number;
    }>;
    summary: string;
  };
}

/**
 * Helper to convert IncomeAllocation + InvestmentAllocation to final Allocation
 */
export function calculateFinalAllocation(
  incomeAlloc: IncomeAllocation,
  investmentAlloc: InvestmentPoolAllocation
): Allocation {
  const investmentPoolPct = incomeAlloc.investmentPool;
  
  return {
    growth: (investmentPoolPct * investmentAlloc.growth) / 100,
    stability: (investmentPoolPct * investmentAlloc.stability) / 100,
    special: (investmentPoolPct * investmentAlloc.special) / 100,
    essentials: incomeAlloc.essentials,
    rewards: incomeAlloc.rewards,
  };
}

