import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { HeroMetrics } from '../components/dashboard/HeroMetrics';
import { AssetAllocationDonut } from '../components/charts/AssetAllocationDonut';
import { SpendingBarChart } from '../components/charts/SpendingBarChart';
import { ActionCenter } from '../components/dashboard/ActionCenter';
import { useAppStore } from '../store/useAppStore';
import { getMonthlySpendingChartData, generateActionItems } from '../algorithms/spendingAnalytics';
import { getTotalCashValue } from '../algorithms/insuranceDispatch';
import type { InvestmentCategoryType } from '../types';

export default function DashboardPage() {
  const store = useAppStore();
  const data = store.getCurrentData();
  const { spending, policies, monthlyIncome } = data;

  const totalAssets =
    store.getCategoryTotal('growth') +
    store.getCategoryTotal('stability') +
    store.getCategoryTotal('special') +
    store.getCategoryTotal('emergency');
  const cashValue = getTotalCashValue(policies);
  const totalNetWorth = totalAssets + cashValue;

  const ma3Spending = store.getMA3Spending();
  const riskLeverageRatio = store.getRiskLeverageRatio();

  const chartData = getMonthlySpendingChartData(spending);
  const targetMonthlySpending = monthlyIncome * 0.5;

  const actionItems = generateActionItems(data);

  const TARGET_CATEGORIES: Array<'growth' | 'stability' | 'special'> = ['growth', 'stability', 'special'];
  const recommendedAllocation = store.getRecommendedAllocation();
  const userTargets = store.getInvestmentTargets();
  const activeTargets = userTargets ?? recommendedAllocation?.investmentAllocation;

  const assetCategoryData: Array<{ key: InvestmentCategoryType; percentage: number; target?: number }> = [
    ...TARGET_CATEGORIES.map((cat) => ({
      key: cat as InvestmentCategoryType,
      percentage: store.getCategoryPercentage(cat),
      target: activeTargets ? parseFloat(activeTargets[cat].toFixed(1)) : undefined,
    })),
    {
      key: 'emergency' as const,
      percentage: store.getCategoryPercentage('emergency'),
    },
  ];

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto pb-20 pt-10 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">综合看板</h1>
          <p className="text-gray-400 text-sm mt-1">资产、支出与风险保障的全局视图</p>
        </motion.div>

        {/* Hero Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <HeroMetrics
            totalNetWorth={totalNetWorth}
            ma3Spending={ma3Spending}
            riskLeverageRatio={riskLeverageRatio}
          />
        </motion.div>

        {/* Allocation Donut + Spending Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-white">资产配置分布</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">投资组合与目标偏差</p>
            </div>
            {totalAssets > 0 ? (
              <AssetAllocationDonut categories={assetCategoryData} />
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
                尚未录入投资账户
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-white">支出趋势</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">近期月度支出与移动平均</p>
            </div>
            {chartData.length > 0 ? (
              <SpendingBarChart data={chartData} targetMonthly={targetMonthlySpending} />
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
                暂无支出数据
              </div>
            )}
          </Card>
        </motion.div>

        {/* Action Center */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <h2 className="text-base font-semibold text-white mb-4">待办事项</h2>
            <ActionCenter items={actionItems} />
          </Card>
        </motion.div>
      </div>
    </PageContainer>
  );
}
