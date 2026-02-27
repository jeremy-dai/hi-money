import type { Allocation } from '../../types';
import { ALLOCATION_COLORS, DEFAULT_ALLOCATION } from '../../utils/constants';
import { formatCNY } from '../../lib/format';

const KEYS: (keyof Allocation)[] = ['growth', 'stability', 'essentials', 'rewards'];

const META: Record<keyof Allocation, { name: string; desc: string }> = {
  growth:     { name: '增长投资', desc: '股票、ETF、基金' },
  stability:  { name: '稳健储蓄', desc: '债券、应急金' },
  essentials: { name: '基本开支', desc: '房租、餐饮、日常' },
  rewards:    { name: '享乐奖励', desc: '旅行、娱乐' },
};

interface Props {
  allocation: Allocation;
  monthlyIncome?: number;
}

export function AllocationBreakdown({ allocation, monthlyIncome = 0 }: Props) {
  const items = KEYS.map((k) => {
    const pct = allocation[k] ?? DEFAULT_ALLOCATION[k];
    const defaultPct = DEFAULT_ALLOCATION[k];
    const deviation = parseFloat((pct - defaultPct).toFixed(1));
    return {
      key: k,
      ...META[k],
      pct,
      deviation,
      color: ALLOCATION_COLORS[k],
      amount: monthlyIncome * (pct / 100),
    };
  });

  return (
    <div className="space-y-5 mt-4">
      {/* Segmented proportion bar */}
      <div>
        <div className="flex h-3 rounded-full overflow-hidden">
          {items.map((item, i) => (
            <div
              key={item.key}
              style={{ width: `${item.pct}%`, backgroundColor: item.color }}
              className={`h-full transition-all ${i > 0 ? 'border-l border-black/30' : ''}`}
            />
          ))}
        </div>
        <div className="flex mt-2">
          {items.map((item) => (
            <div key={item.key} style={{ width: `${item.pct}%` }} className="flex justify-start">
              <div className="flex items-center gap-1 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-gray-500 truncate hidden sm:block">{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {items.map((item) => (
          <div
            key={item.key}
            className="relative rounded-xl bg-white/[0.03] border border-white/[0.07] p-3.5 overflow-hidden"
          >
            {/* Left accent bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
              style={{ backgroundColor: item.color }}
            />

            <div className="flex items-baseline justify-between gap-1 mb-0.5">
              <span className="text-xs font-medium" style={{ color: item.color }}>
                {item.name}
              </span>
              <span className="text-xl font-bold text-white font-mono leading-none">
                {item.pct}%
              </span>
            </div>

            <p className="text-[11px] text-gray-500">{item.desc}</p>

            {monthlyIncome > 0 && (
              <p className="text-sm font-mono font-semibold text-gray-200 mt-2">
                {formatCNY(item.amount)}
                <span className="text-[10px] text-gray-500 font-normal ml-0.5">/月</span>
              </p>
            )}

            {item.deviation !== 0 && (
              <span
                className={`mt-1.5 inline-block text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  Math.abs(item.deviation) <= 3
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : Math.abs(item.deviation) <= 8
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {item.deviation > 0 ? '+' : ''}{item.deviation}% vs 默认
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
