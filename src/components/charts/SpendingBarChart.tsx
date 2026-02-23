import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { MonthlySpendingDataPoint } from '../../algorithms/spendingAnalytics';

interface Props {
  data: MonthlySpendingDataPoint[];
  targetMonthly: number;
}

const formatY = (v: number) =>
  v >= 10000 ? `${(v / 10000).toFixed(1)}万` : `${(v / 1000).toFixed(0)}k`;

export function SpendingBarChart({ data, targetMonthly }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatY}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          contentStyle={{
            background: '#1a1a2e',
            border: '1px solid #ffffff15',
            borderRadius: '8px',
            color: '#fff',
            fontSize: 12,
          }}
          formatter={((value: number | undefined, name: string) => [
            `¥${(value ?? 0).toLocaleString()}`,
            name === 'amount' ? '实际支出' : 'MA-3 均值',
          ]) as never}
        />
        <Legend
          formatter={(v) => (v === 'amount' ? '实际支出' : 'MA-3 均值')}
          wrapperStyle={{ fontSize: 11, color: '#9ca3af' }}
        />
        {targetMonthly > 0 && (
          <ReferenceLine
            y={targetMonthly}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{ value: '目标', fill: '#f59e0b', fontSize: 10, position: 'right' }}
          />
        )}
        <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Line
          dataKey="ma3"
          type="monotone"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
