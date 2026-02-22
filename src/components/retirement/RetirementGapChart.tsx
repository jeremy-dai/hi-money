/**
 * Retirement Gap Chart Component
 * 
 * Visualizes retirement gap analysis with waterfall charts,
 * scenario comparisons, and action plans.
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../common/Card';
import type { RetirementGapResult } from '../../types/retirement.types';

interface RetirementGapChartProps {
  result: RetirementGapResult;
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  if (amount >= 100000000) {
    return `¥${(amount / 100000000).toFixed(1)}亿`;
  } else if (amount >= 10000) {
    return `¥${(amount / 10000).toFixed(1)}万`;
  }
  return `¥${amount.toLocaleString('zh-CN')}`;
}

export function RetirementGapChart({ result }: RetirementGapChartProps) {
  // Prepare waterfall chart data for corpus analysis
  const waterfallData = [
    {
      name: '所需资金',
      value: result.corpus.requiredCorpus,
      type: 'required',
    },
    {
      name: '现有储蓄',
      value: result.corpus.currentSavingsFutureValue,
      type: 'savings',
    },
    {
      name: '未来投入',
      value: result.corpus.contributionsFutureValue,
      type: 'contributions',
    },
    {
      name: '资金缺口',
      value: result.corpus.corpusGap,
      type: 'gap',
    },
  ];

  // Scenario comparison data
  const scenarioData = result.scenarios.map((scenario) => ({
    name:
      scenario.scenario === 'basic'
        ? '基础生活'
        : scenario.scenario === 'comfortable'
        ? '舒适生活'
        : '富裕生活',
    monthlySavings: scenario.monthlySavingsNeeded,
    requiredCorpus: scenario.requiredCorpus,
    isAchievable: scenario.isAchievable,
  }));

  return (
    <div className="space-y-6">
      {/* Hero Card: Years to Retirement */}
      <Card>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">退休倒计时</h3>
          <p className="text-5xl font-bold text-gold-primary mb-4">
            {result.yearsToRetirement} 年
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-black-soft rounded-lg p-4">
              <span className="text-sm text-gray-400">预计养老金</span>
              <p className="text-xl font-bold text-white font-mono mt-1">
                {formatCurrency(result.pension.estimatedMonthlyPension)}/月
              </p>
            </div>
            <div className="bg-black-soft rounded-lg p-4">
              <span className="text-sm text-gray-400">期望收入</span>
              <p className="text-xl font-bold text-gold-primary font-mono mt-1">
                {formatCurrency(result.desiredMonthlyIncome)}/月
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Corpus Waterfall Chart */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-6">资金需求分析</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            <Bar dataKey="value" name="金额">
              {waterfallData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.type === 'required'
                      ? '#D4AF37'
                      : entry.type === 'gap'
                      ? '#EF4444'
                      : entry.type === 'savings'
                      ? '#10B981'
                      : '#3B82F6'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">所需总资金</span>
            <p className="text-white font-mono font-semibold">
              {formatCurrency(result.corpus.requiredCorpus)}
            </p>
          </div>
          <div>
            <span className="text-gray-400">资金缺口</span>
            <p className="text-red-400 font-mono font-semibold">
              {formatCurrency(result.corpus.corpusGap)}
            </p>
          </div>
        </div>
      </Card>

      {/* Scenario Comparison */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-6">生活场景对比</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={scenarioData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            <Bar dataKey="monthlySavings" fill="#D4AF37" name="月储蓄需求" />
            <Bar dataKey="requiredCorpus" fill="#3B82F6" name="所需资金" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {scenarioData.map((scenario, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-black-soft rounded-lg p-3"
            >
              <span className="text-white">{scenario.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  月储蓄: {formatCurrency(scenario.monthlySavings)}
                </span>
                {scenario.isAchievable ? (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                    可实现
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                    需调整
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Plan */}
      <Card>
        <div
          className="mb-4 p-4 rounded-lg border"
          style={{
            backgroundColor:
              result.summary.gapSeverity === 'none'
                ? '#10B98120'
                : result.summary.gapSeverity === 'small'
                ? '#F59E0B20'
                : result.summary.gapSeverity === 'moderate'
                ? '#F9731620'
                : '#EF444420',
            borderColor:
              result.summary.gapSeverity === 'none'
                ? '#10B981'
                : result.summary.gapSeverity === 'small'
                ? '#F59E0B'
                : result.summary.gapSeverity === 'moderate'
                ? '#F97316'
                : '#EF4444',
          }}
        >
          <h3 className="text-xl font-bold text-white mb-2">关键信息</h3>
          <p className="text-white">{result.summary.keyMessage}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black-soft rounded-lg p-4">
            <span className="text-sm text-gray-400">月储蓄目标</span>
            <p className="text-2xl font-bold text-gold-primary font-mono mt-1">
              {formatCurrency(result.actionPlan.monthlySavingsTarget)}
            </p>
          </div>
          <div className="bg-black-soft rounded-lg p-4">
            <span className="text-sm text-gray-400">储蓄率</span>
            <p className="text-2xl font-bold text-white font-mono mt-1">
              {result.actionPlan.savingsRate}%
            </p>
          </div>
          <div className="bg-black-soft rounded-lg p-4">
            <span className="text-sm text-gray-400">年储蓄目标</span>
            <p className="text-2xl font-bold text-white font-mono mt-1">
              {formatCurrency(result.actionPlan.annualSavingsTarget)}
            </p>
          </div>
          <div className="bg-black-soft rounded-lg p-4">
            <span className="text-sm text-gray-400">规划状态</span>
            <p
              className="text-2xl font-bold font-mono mt-1"
              style={{
                color: result.actionPlan.isOnTrack ? '#10B981' : '#EF4444',
              }}
            >
              {result.actionPlan.isOnTrack ? '正常' : '需调整'}
            </p>
          </div>
        </div>

        <div className="bg-black-soft rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">行动建议</h4>
          <ul className="space-y-2">
            {result.summary.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-300">
                <span className="text-gold-primary mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Pension Analysis */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">养老金分析</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black-soft rounded-lg p-4">
            <span className="text-sm text-gray-400">预计月养老金</span>
            <p className="text-xl font-bold text-white font-mono mt-1">
              {formatCurrency(result.pension.estimatedMonthlyPension)}
            </p>
          </div>
          <div className="bg-black-soft rounded-lg p-4">
            <span className="text-sm text-gray-400">替代率</span>
            <p className="text-xl font-bold text-gold-primary font-mono mt-1">
              {result.pension.replacementRate}%
            </p>
          </div>
          <div className="bg-black-soft rounded-lg p-4">
            <span className="text-sm text-gray-400">养老金缺口</span>
            <p className="text-xl font-bold text-red-400 font-mono mt-1">
              {formatCurrency(result.pension.pensionShortfall)}/月
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

