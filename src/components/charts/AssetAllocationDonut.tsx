import type { InvestmentCategoryType } from '../../types';
import { INVESTMENT_CATEGORY_COLORS, INVESTMENT_CATEGORY_NAMES } from '../../utils/constants';

interface CategoryData {
  key: InvestmentCategoryType;
  percentage: number;
  target?: number;
}

interface Props {
  categories: CategoryData[];
}

function deviationColor(deviation: number): string {
  const abs = Math.abs(deviation);
  if (abs <= 2) return 'text-gray-500';
  if (abs <= 5) return 'text-amber-400';
  return 'text-red-400';
}

export function AssetAllocationDonut({ categories }: Props) {
  const hasTargets = categories.some((c) => c.target !== undefined);

  const data = categories.map((cat) => ({
    key: cat.key,
    name: INVESTMENT_CATEGORY_NAMES[cat.key],
    value: cat.percentage,
    target: cat.target,
    deviation: cat.target !== undefined ? parseFloat((cat.percentage - cat.target).toFixed(1)) : 0,
    color: INVESTMENT_CATEGORY_COLORS[cat.key],
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Stacked bar */}
      <div className="flex h-5 rounded-full overflow-hidden bg-white/5">
        {data.map((item) => (
          <div
            key={item.key}
            className="h-full transition-all duration-500"
            style={{ width: `${item.value}%`, backgroundColor: item.color }}
          />
        ))}
      </div>

      {/* Category rows */}
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-300 font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-200 font-medium">{item.value}%</span>
                {hasTargets && Math.abs(item.deviation) > 2 && (
                  <span className={`font-mono text-xs ${deviationColor(item.deviation)}`}>
                    {item.deviation > 0 ? '+' : ''}{item.deviation}
                  </span>
                )}
              </div>
            </div>
            {hasTargets && item.target !== undefined && (
              <div className="flex items-center gap-2 ml-[18px]">
                <div className="flex-1 h-1 rounded-full bg-white/5 relative">
                  <div
                    className="absolute h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(item.value, 100)}%`,
                      backgroundColor: item.color,
                      opacity: 0.4,
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-2.5 bg-white/40 rounded-full"
                    style={{ left: `${Math.min(item.target, 100)}%` }}
                    title={`目标 ${item.target}%`}
                  />
                </div>
                <span className="text-[10px] text-gray-600 shrink-0 w-14 text-right">
                  目标 {item.target}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
