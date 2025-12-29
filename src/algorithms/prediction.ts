import type { HistoryRecord } from '../types';

export interface PredictionResult {
  monthsNeeded: number;
  estimatedDate: string;
  monthlyGrowthRate: number;
}

/**
 * Calculate prediction for goal achievement based on historical growth
 * Estimates monthly growth rate and calculates when the goal will be reached
 *
 * Ported from: pages/analytics/analytics.js lines 96-145
 */
export function calculatePrediction(
  goalAmount: number,
  totalAssets: number,
  history: HistoryRecord[]
): PredictionResult {
  if (history.length < 2 || totalAssets >= goalAmount) {
    return {
      monthsNeeded: 0,
      estimatedDate: '已达成目标',
      monthlyGrowthRate: 0,
    };
  }

  const first = history[0];
  const last = history[history.length - 1];
  const startDate = new Date(first.date);
  const endDate = new Date(last.date);
  const monthsDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsDiff <= 0) {
    return {
      monthsNeeded: 0,
      estimatedDate: '数据不足',
      monthlyGrowthRate: 0,
    };
  }

  const totalGrowth = last.totalAmount - first.totalAmount;
  const monthlyGrowth = totalGrowth / monthsDiff;

  if (monthlyGrowth <= 0) {
    return {
      monthsNeeded: 999,
      estimatedDate: '需要增加储蓄',
      monthlyGrowthRate: 0,
    };
  }

  const remaining = goalAmount - totalAssets;
  const monthsNeeded = Math.ceil(remaining / monthlyGrowth);

  const estimatedDate = new Date();
  estimatedDate.setMonth(estimatedDate.getMonth() + monthsNeeded);
  const dateStr = `${estimatedDate.getFullYear()}年${estimatedDate.getMonth() + 1}月`;

  return {
    monthsNeeded,
    estimatedDate: dateStr,
    monthlyGrowthRate: parseFloat(monthlyGrowth.toFixed(2)),
  };
}
