import { PieChart as RechartsPC, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PieChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface PieChartProps {
  data: PieChartData[];
  innerRadius?: number;
  outerRadius?: number;
}

export function PieChart({ data, innerRadius = 60, outerRadius = 100 }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPC>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          dataKey="value"
          startAngle={90}
          endAngle={450}
          animationBegin={0}
          animationDuration={800}
          paddingAngle={2}
          stroke="#0A0A0A"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | string | Array<number | string> | undefined) => {
            if (typeof value === 'number') {
              return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
            return String(value || '');
          }}
          contentStyle={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #D4AF37',
            borderRadius: '8px',
            color: '#FFFFFF',
            padding: '12px',
            boxShadow: '0 4px 24px rgba(212, 175, 55, 0.15)',
          }}
          labelStyle={{
            color: '#FFFFFF',
            fontWeight: 600,
            marginBottom: '4px',
          }}
          itemStyle={{
            color: '#F5F5F5',
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span className="text-sm text-white-soft">{value}</span>}
          iconType="circle"
        />
      </RechartsPC>
    </ResponsiveContainer>
  );
}
