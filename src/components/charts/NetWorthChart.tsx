import { useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';
import type { HistoryRecord } from '../../types';

interface NetWorthChartProps {
  history: HistoryRecord[];
}

type TimePeriod = '30d' | '90d' | '1yr' | 'all';

export function NetWorthChart({ history }: NetWorthChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('all');

  // Filter and format data based on selected period
  const chartData = useMemo(() => {
    if (history.length === 0) return [];

    const now = new Date();
    const cutoffDate = new Date();

    switch (selectedPeriod) {
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1yr':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        cutoffDate.setFullYear(2000); // Very old date to include all
        break;
    }

    const filtered = history.filter((record) => new Date(record.date) >= cutoffDate);

    // If no data in period, show all available data
    const dataToUse = filtered.length > 0 ? filtered : history;

    return dataToUse.map((record) => {
      const date = new Date(record.date);
      return {
        date: record.date,
        value: record.totalAmount,
        displayDate: date.toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric',
          ...(selectedPeriod === 'all' || selectedPeriod === '1yr' ? { year: 'numeric' } : {}),
        }),
      };
    });
  }, [history, selectedPeriod]);

  // Calculate returns
  const returns = useMemo(() => {
    if (chartData.length < 2) {
      return { ytd: 0, allTime: 0, current: 0, initial: 0 };
    }

    const current = chartData[chartData.length - 1].value;
    const initial = chartData[0].value;
    const allTimeReturn = initial > 0 ? ((current - initial) / initial) * 100 : 0;

    // YTD calculation
    const currentYear = new Date().getFullYear();
    const ytdData = history.filter(
      (record) => new Date(record.date).getFullYear() === currentYear
    );
    const ytdInitial = ytdData.length > 0 ? ytdData[0].totalAmount : current;
    const ytdReturn = ytdInitial > 0 ? ((current - ytdInitial) / ytdInitial) * 100 : 0;

    return {
      ytd: ytdReturn,
      allTime: allTimeReturn,
      current,
      initial,
    };
  }, [chartData, history]);

  const periodButtons: { label: string; value: TimePeriod }[] = [
    { label: '30天', value: '30d' },
    { label: '90天', value: '90d' },
    { label: '1年', value: '1yr' },
    { label: '全部', value: 'all' },
  ];

  // Determine gradient colors based on performance
  const isPositive = returns.allTime >= 0;
  const gradientId = 'netWorthGradient';

  return (
    <div>
      {/* Header with Returns */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">净值增长</h3>
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-xs text-gray-400">年初至今</p>
              <p
                className={`text-lg font-bold ${
                  returns.ytd >= 0 ? 'text-growth' : 'text-red-500'
                }`}
              >
                {returns.ytd >= 0 ? '+' : ''}
                {returns.ytd.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">总回报</p>
              <p
                className={`text-lg font-bold ${
                  returns.allTime >= 0 ? 'text-growth' : 'text-red-500'
                }`}
              >
                {returns.allTime >= 0 ? '+' : ''}
                {returns.allTime.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Period Selectors */}
        <div className="flex gap-2">
          {periodButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setSelectedPeriod(btn.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                selectedPeriod === btn.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-black-soft text-gray-400 hover:bg-black-elevated hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isPositive ? '#10B981' : '#EF4444'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={isPositive ? '#10B981' : '#EF4444'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="displayDate"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickLine={{ stroke: '#374151' }}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickLine={{ stroke: '#374151' }}
                tickFormatter={(value) =>
                  `¥${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
                }
              />
              <Tooltip
                formatter={(value: number | string | Array<number | string> | undefined) => {
                  if (typeof value === 'number') {
                    return `¥${value.toLocaleString('zh-CN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`;
                  }
                  return String(value || '');
                }}
                labelFormatter={(label) => `日期: ${label}`}
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #4F46E5',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  padding: '12px',
                  boxShadow: '0 4px 24px rgba(79, 70, 229, 0.2)',
                }}
                labelStyle={{
                  color: '#FFFFFF',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
                itemStyle={{
                  color: '#F5F5F5',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? '#10B981' : '#EF4444'}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                animationDuration={1000}
                name="净值"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <div className="h-[300px] flex items-center justify-center bg-black-soft rounded-lg border border-gray-700">
          <div className="text-center">
            <p className="text-gray-400 mb-2">暂无历史数据</p>
            <p className="text-sm text-gray-500">开始记录您的投资后，这里将显示净值增长趋势</p>
          </div>
        </div>
      )}
    </div>
  );
}
