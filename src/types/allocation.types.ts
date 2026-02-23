import type { Allocation } from './store.types';

export interface IncomeAllocation {
  investmentPool: number;
  essentials: number;
  rewards: number;
}

export interface InvestmentPoolAllocation {
  growth: number;
  stability: number;
  special: number; // internal split, not in top-level Allocation
}

export interface AllocationRecommendation {
  incomeAllocation: IncomeAllocation;
  investmentAllocation: InvestmentPoolAllocation;
  finalAllocation: Allocation;
  rationale: {
    factors: Array<{ name: string; impact: string; weight: number }>;
    summary: string;
  };
}

export function calculateFinalAllocation(
  incomeAlloc: IncomeAllocation,
  _investmentAlloc: InvestmentPoolAllocation
): Allocation {
  const pool = incomeAlloc.investmentPool;
  // Split investment pool: default 60% growth, 40% stability (special is a sub-account)
  const growthPct = _investmentAlloc.growth;
  const stabilityPct = _investmentAlloc.stability;
  return {
    growth: parseFloat(((pool * growthPct) / 100).toFixed(1)),
    stability: parseFloat(((pool * stabilityPct) / 100).toFixed(1)),
    essentials: incomeAlloc.essentials,
    rewards: incomeAlloc.rewards,
  };
}
