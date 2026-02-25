import {
  ComposedChart,
  Bar,
  LabelList,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlySpendingDataPoint } from '../../algorithms/spendingAnalytics';

interface Props {
  data: MonthlySpendingDataPoint[];
  targetMonthly: number;
}

const formatY = (v: number) => `${Math.round(v / 1000)}k`;
const formatKLabel = (v: number) => {
  const k = v / 1000;
  const value = k >= 100 ? k.toFixed(0) : k.toFixed(1);
  return `${value.replace(/\.0$/, '')}k`;
};

export function SpendingBarChart({ data, targetMonthly }: Props) {
  const amounts = data.map((item) => item.amount);
  const maxAmount = Math.max(...amounts, targetMonthly, 10000);
  const minAmount = Math.min(...amounts);
  const maxIndex = amounts.indexOf(maxAmount);
  const minIndex = amounts.indexOf(minAmount);
  const lastIndex = data.length - 1;
  const tickStep = 10000;
  const tickMax = Math.max(tickStep, Math.ceil(maxAmount / tickStep) * tickStep);
  const ticks = Array.from({ length: Math.floor(tickMax / tickStep) + 1 }, (_, i) => i * tickStep);

  return (
    <div className="flex flex-col gap-3">
      {/* Custom legend */}
      <div className="flex items-center gap-4 text-[11px] text-gray-400 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
          <span>实际支出</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 rounded-full bg-emerald-500" />
          <span>MA-3 均值</span>
        </div>
        {targetMonthly > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0 border-t border-dashed border-amber-500" />
            <span>月度目标</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 12, left: -4, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#4338ca" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatY}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
            ticks={ticks}
            domain={[0, tickMax]}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(15, 15, 30, 0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: 12,
              backdropFilter: 'blur(8px)',
              padding: '8px 12px',
            }}
            formatter={((value: number | undefined, name: string) => [
              `¥${(value ?? 0).toLocaleString()}`,
              name === 'amount' ? '实际支出' : 'MA-3 均值',
            ]) as never}
          />
          {targetMonthly > 0 && (
            <ReferenceLine
              y={targetMonthly}
              stroke="#f59e0b"
              strokeDasharray="6 3"
              strokeOpacity={0.6}
              label={{ value: '目标', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
            />
          )}
          <Bar dataKey="amount" fill="url(#barGradient)" radius={[5, 5, 0, 0]} maxBarSize={36}>
            <LabelList
              dataKey="amount"
              content={({ x, y, width, value, index }) => {
                if (typeof value !== 'number') return null;
                if (index !== maxIndex && index !== minIndex && index !== lastIndex) return null;
                const labelX = Number(x ?? 0) + Number(width ?? 0) / 2;
                const labelY = Number(y ?? 0) - 6;
                return (
                  <text
                    x={labelX}
                    y={labelY}
                    fill="#c7d2fe"
                    fontSize={10}
                    textAnchor="middle"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace"
                  >
                    {formatKLabel(value)}
                  </text>
                );
              }}
            />
          </Bar>
          <Line
            dataKey="ma3"
            type="monotone"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
