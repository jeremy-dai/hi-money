import type { Allocation, CategoryType } from '../types';

export interface CategoryStatus {
  amount: number;
  percentage: number;
  deviation: number;
}

export interface CurrentStatus {
  growth: CategoryStatus;
  stability: CategoryStatus;
  essentials: CategoryStatus;
  rewards: CategoryStatus;
}

/**
 * Calculate smart allocation based on current deviations from target percentages
 * Plan A: Fixed allocation based on target percentages
 * Plan B: Smart rebalancing that prioritizes under-allocated categories
 *
 * Ported from: pages/allocate-income/allocate-income.js lines 100-171
 */
export function calculateSmartAllocation(
  income: number,
  currentStatus: CurrentStatus,
  targetAllocation: Allocation
): Allocation {
  const deviations = {
    growth: currentStatus.growth.deviation,
    stability: currentStatus.stability.deviation,
    essentials: currentStatus.essentials.deviation,
    rewards: currentStatus.rewards.deviation,
  };

  // Categorize deficit and surplus
  const deficit: Record<string, number> = {};
  const surplus: Record<string, number> = {};
  let totalDeficit = 0;

  for (const category in deviations) {
    const dev = deviations[category as CategoryType];
    if (dev < 0) {
      deficit[category] = Math.abs(dev);
      totalDeficit += Math.abs(dev);
    } else if (dev > 0) {
      surplus[category] = dev;
    }
  }

  const allocation: Record<string, number> = {};

  if (totalDeficit === 0) {
    // No deficit - use fixed allocation
    for (const category in targetAllocation) {
      const cat = category as CategoryType;
      allocation[cat] = (income * targetAllocation[cat]) / 100;
    }
  } else {
    // Has deficit - prioritize rebalancing
    let remainingIncome = income;

    // Give extra to deficit categories
    for (const category in deficit) {
      const cat = category as CategoryType;
      const weight = deficit[category] / totalDeficit;
      const extraAllocation = weight * income * 0.3; // Extra 30%
      const baseAllocation = (income * targetAllocation[cat]) / 100;
      allocation[cat] = baseAllocation + extraAllocation;
      remainingIncome -= allocation[cat];
    }

    // Reduce surplus categories
    for (const category in surplus) {
      const cat = category as CategoryType;
      const reduction = ((income * targetAllocation[cat]) / 100) * 0.5; // Reduce 50%
      allocation[cat] = (income * targetAllocation[cat]) / 100 - reduction;
      remainingIncome -= allocation[cat];
    }

    // Distribute to other categories
    for (const category in targetAllocation) {
      const cat = category as CategoryType;
      if (!deficit[category] && !surplus[category]) {
        allocation[cat] = (income * targetAllocation[cat]) / 100;
        remainingIncome -= allocation[cat];
      }
    }

    // Adjust for any remaining income
    if (Math.abs(remainingIncome) > 0.01) {
      for (const category in allocation) {
        const cat = category as CategoryType;
        allocation[cat] += (remainingIncome * targetAllocation[cat]) / 100;
      }
    }
  }

  return {
    growth: allocation.growth || 0,
    stability: allocation.stability || 0,
    essentials: allocation.essentials || 0,
    rewards: allocation.rewards || 0,
  };
}

/**
 * Calculate fixed allocation based on target percentages (Plan A)
 */
export function calculateFixedAllocation(income: number, targetAllocation: Allocation): Allocation {
  return {
    growth: (income * targetAllocation.growth) / 100,
    stability: (income * targetAllocation.stability) / 100,
    essentials: (income * targetAllocation.essentials) / 100,
    rewards: (income * targetAllocation.rewards) / 100,
  };
}
