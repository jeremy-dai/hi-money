import { useState } from 'react';
import type { InvestmentPoolAllocation } from '../../types/allocation.types';
import type { InvestmentCategoryType } from '../../types';
import { INVESTMENT_CATEGORY_NAMES, INVESTMENT_CATEGORY_COLORS } from '../../utils/constants';
import { formatCNY } from '../../lib/format';

interface Props {
  recommendedAllocation: InvestmentPoolAllocation;
  currentTotals: Record<InvestmentCategoryType, number>;
  totalCurrentAssets: number;
}

const CATEGORIES: Array<'growth' | 'stability' | 'special'> = ['growth', 'stability', 'special'];

export function AllocationCalculator({ recommendedAllocation, currentTotals, totalCurrentAssets }: Props) {
  const [investAmount, setInvestAmount] = useState('');

  const amount = parseFloat(investAmount) || 0;
  const newTotal = totalCurrentAssets + amount;

  const allocations = CATEGORIES.map((cat) => {
    const targetPct = recommendedAllocation[cat];
    const targetAmount = newTotal * (targetPct / 100);
    const current = currentTotals[cat];
    const toAdd = Math.max(0, targetAmount - current);
    return { key: cat, targetPct, targetAmount, current, toAdd };
  });

  const totalToAdd = allocations.reduce((sum, a) => sum + a.toAdd, 0);

  return (
    <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
      <div>
        <label className="text-xs text-gray-400 block mb-1.5">计划投入金额（元）</label>
        <input
          type="number"
          value={investAmount}
          onChange={(e) => setInvestAmount(e.target.value)}
          placeholder="例：100000"
          className="w-full bg-black-soft border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
        />
      </div>

      {amount > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs text-gray-400">
            投入 {formatCNY(amount)} 后，建议按以下方式分配：
          </p>
          {allocations.map((alloc) => (
            <div key={alloc.key} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: INVESTMENT_CATEGORY_COLORS[alloc.key] }}
              />
              <span className="text-sm text-gray-300 flex-1">
                {INVESTMENT_CATEGORY_NAMES[alloc.key]}
              </span>
              <div className="text-right">
                {alloc.toAdd > 0 ? (
                  <span className="text-sm font-mono text-white">
                    +{formatCNY(alloc.toAdd)}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">已超配，暂无需追加</span>
                )}
              </div>
            </div>
          ))}

          {totalToAdd > 0 && Math.abs(totalToAdd - amount) > 1 && (
            <p className="text-xs text-gray-500">
              * 建议追加合计 {formatCNY(totalToAdd)}，
              {totalToAdd < amount
                ? `剩余 ${formatCNY(amount - totalToAdd)} 可灵活配置`
                : `超出投入 ${formatCNY(totalToAdd - amount)}，可按比例缩减`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
