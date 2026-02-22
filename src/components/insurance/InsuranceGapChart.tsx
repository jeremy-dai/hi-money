/**
 * Insurance Gap Chart Component
 * 
 * Visualizes insurance coverage gaps with bar charts showing
 * existing vs recommended coverage, priority recommendations,
 * and family allocation breakdown.
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card';
import type { InsuranceGapResult } from '../../types/insurance.types';

interface InsuranceGapChartProps {
  result: InsuranceGapResult;
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `¥${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 10000) {
    return `¥${(amount / 10000).toFixed(1)}万`;
  }
  return `¥${amount.toLocaleString('zh-CN')}`;
}


export function InsuranceGapChart({ result }: InsuranceGapChartProps) {
  // Prepare data for coverage comparison chart
  const coverageData = [
    {
      name: '寿险',
      recommended: result.recommendedCoverage.life,
      existing: result.existingCoverage.life,
      gap: result.gaps.life,
    },
    {
      name: '重疾险',
      recommended: result.recommendedCoverage.criticalIllness,
      existing: result.existingCoverage.criticalIllness,
      gap: result.gaps.criticalIllness,
    },
    {
      name: '医疗险',
      recommended: result.recommendedCoverage.medical,
      existing: result.existingCoverage.medical,
      gap: result.gaps.medical,
    },
    {
      name: '意外险',
      recommended: result.recommendedCoverage.accident,
      existing: result.existingCoverage.accident,
      gap: result.gaps.accident,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Coverage Gap Chart */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-6">保障缺口分析</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={coverageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#999' }}
              axisLine={{ stroke: '#555' }}
            />
            <YAxis
              tick={{ fill: '#999' }}
              axisLine={{ stroke: '#555' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              formatter={(value: any) => formatCurrency(Number(value))}
              contentStyle={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #D4AF37',
                borderRadius: '8px',
                color: '#FFFFFF',
              }}
            />
            <Legend
              formatter={(value) => <span className="text-sm text-gray-400">{value}</span>}
            />
            <Bar dataKey="recommended" fill="#D4AF37" name="建议保额" />
            <Bar dataKey="existing" fill="#10B981" name="现有保额" />
            <Bar dataKey="gap" fill="#EF4444" name="保障缺口" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Priority Recommendations */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">优先级推荐</h3>
        <div className="space-y-4">
          {result.recommendations.map((rec, index) => (
            <div
              key={index}
              className="bg-black-soft rounded-lg p-4 border border-black-border"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor:
                        rec.priority === 'high'
                          ? '#EF4444'
                          : rec.priority === 'medium'
                          ? '#F59E0B'
                          : '#10B981',
                      color: '#FFFFFF',
                    }}
                  >
                    {rec.priority === 'high' ? '高' : rec.priority === 'medium' ? '中' : '低'}
                  </span>
                  <h4 className="text-lg font-semibold text-white">{rec.name}</h4>
                </div>
                <span className="text-sm text-gray-400">
                  年保费约 {formatCurrency(rec.estimatedPremium)}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{rec.urgency}</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">建议保额</span>
                  <p className="text-white font-mono">{formatCurrency(rec.recommendedAmount)}</p>
                </div>
                <div>
                  <span className="text-gray-500">现有保额</span>
                  <p className="text-white font-mono">{formatCurrency(rec.existingAmount)}</p>
                </div>
                <div>
                  <span className="text-gray-500">保障缺口</span>
                  <p className="text-red-400 font-mono">{formatCurrency(rec.gap)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Family Allocation (if applicable) */}
      {result.familyAllocation && (
        <Card>
          <h3 className="text-xl font-bold text-white mb-4">家庭保障分配 (6:3:1)</h3>
          <div className="space-y-4">
            <div className="bg-black-soft rounded-lg p-4 border border-black-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white">主要收入者 (60%)</h4>
                <span className="text-sm text-gray-400">
                  预算: {formatCurrency(result.familyAllocation.primaryEarner.budget)}
                </span>
              </div>
              <div className="space-y-2">
                {result.familyAllocation.primaryEarner.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-400">{rec.name}</span>
                    <span className="text-white font-mono">
                      {formatCurrency(rec.estimatedPremium)}/年
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {result.familyAllocation.secondaryEarner && (
              <div className="bg-black-soft rounded-lg p-4 border border-black-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-white">次要收入者 (30%)</h4>
                  <span className="text-sm text-gray-400">
                    预算: {formatCurrency(result.familyAllocation.secondaryEarner.budget)}
                  </span>
                </div>
                <div className="space-y-2">
                  {result.familyAllocation.secondaryEarner.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-400">{rec.name}</span>
                      <span className="text-white font-mono">
                        {formatCurrency(rec.estimatedPremium)}/年
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.familyAllocation.children && (
              <div className="bg-black-soft rounded-lg p-4 border border-black-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-white">子女 (10%)</h4>
                  <span className="text-sm text-gray-400">
                    预算: {formatCurrency(result.familyAllocation.children.budget)}
                  </span>
                </div>
                <div className="space-y-2">
                  {result.familyAllocation.children.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-400">{rec.name}</span>
                      <span className="text-white font-mono">
                        {formatCurrency(rec.estimatedPremium)}/年
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">保障概况</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black-soft rounded-lg p-4">
            <span className="text-sm text-gray-400">总保障缺口</span>
            <p className="text-2xl font-bold text-red-400 font-mono mt-1">
              {formatCurrency(result.totalGap)}
            </p>
          </div>
          <div className="bg-black-soft rounded-lg p-4">
            <span className="text-sm text-gray-400">保障完整度</span>
            <p className="text-2xl font-bold text-gold-primary font-mono mt-1">
              {result.coverageCompleteness.toFixed(1)}%
            </p>
          </div>
          <div className="bg-black-soft rounded-lg p-4">
            <span className="text-sm text-gray-400">年度保费预算</span>
            <p className="text-2xl font-bold text-white font-mono mt-1">
              {formatCurrency(result.totalBudget)}
            </p>
          </div>
          <div className="bg-black-soft rounded-lg p-4">
            <span className="text-sm text-gray-400">占年收入比例</span>
            <p className="text-2xl font-bold text-white font-mono mt-1">7.5%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

