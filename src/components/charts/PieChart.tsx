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
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | string | Array<number | string> | undefined) => {
            if (typeof value === 'number') {
              return `¥${value.toFixed(2)}`;
            }
            return String(value || '');
          }}
          contentStyle={{
            background: 'white',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span className="text-sm">{value}</span>}
        />
      </RechartsPC>
    </ResponsiveContainer>
  );
}
