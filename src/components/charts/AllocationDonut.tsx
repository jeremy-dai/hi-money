import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { Allocation } from '../../types';
import { ALLOCATION_COLORS, ALLOCATION_NAMES } from '../../utils/constants';

interface Props {
  allocation: Allocation;
  target: Allocation;
}

const ALLOCATION_KEYS: (keyof Allocation)[] = ['growth', 'stability', 'essentials', 'rewards'];

const SHORT_NAMES: Record<keyof Allocation, string> = {
  growth: '增长',
  stability: '稳健',
  essentials: '开支',
  rewards: '享乐',
};

function deviationColor(deviation: number): string {
  const abs = Math.abs(deviation);
  if (abs <= 3) return 'text-emerald-400';
  if (abs <= 8) return 'text-amber-400';
  return 'text-red-400';
}

export function AllocationDonut({ allocation, target }: Props) {
  const data = ALLOCATION_KEYS.map((k) => ({
    key: k,
    name: SHORT_NAMES[k],
    value: allocation[k] ?? 0,
    target: target[k] ?? 0,
    deviation: parseFloat(((allocation[k] ?? 0) - (target[k] ?? 0)).toFixed(1)),
    color: ALLOCATION_COLORS[k],
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} opacity={0.85} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#1a1a2e',
                border: '1px solid #ffffff15',
                borderRadius: '8px',
                color: '#fff',
                fontSize: 12,
              }}
              formatter={((value: number | undefined, _name: string, props: { payload?: { name: string; target: number; deviation: number } }) => [
                `${value ?? 0}%（目标 ${props.payload?.target ?? 0}%）`,
                props.payload?.name ?? '',
              ]) as never}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with deviation */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {data.map((item) => (
          <div key={item.key} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-400">{ALLOCATION_NAMES[item.key as string] ?? item.name}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="font-mono text-gray-200">{item.value}%</span>
              {item.deviation !== 0 && (
                <span className={`font-mono ${deviationColor(item.deviation)}`}>
                  {item.deviation > 0 ? '+' : ''}
                  {item.deviation}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
