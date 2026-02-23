import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { HeroMetrics } from '../components/dashboard/HeroMetrics';
import { AllocationDonut } from '../components/charts/AllocationDonut';
import { SpendingBarChart } from '../components/charts/SpendingBarChart';
import { ActionCenter } from '../components/dashboard/ActionCenter';
import { useAppStore } from '../store/useAppStore';
import { getMonthlySpendingChartData, generateActionItems } from '../algorithms/spendingAnalytics';
import { DEFAULT_ALLOCATION } from '../utils/constants';
import { getTotalCashValue } from '../algorithms/insuranceDispatch';

export default function DashboardPage() {
  const store = useAppStore();
  const data = store.getCurrentData();
  const { allocation, spending, policies, monthlyIncome } = data;

  const totalAssets =
    store.getCategoryTotal('growth') +
    store.getCategoryTotal('stability') +
    store.getCategoryTotal('special');
  const cashValue = getTotalCashValue(policies);
  const totalNetWorth = totalAssets + cashValue;

  const ma3Spending = store.getMA3Spending();
  const riskLeverageRatio = store.getRiskLeverageRatio();

  const chartData = getMonthlySpendingChartData(spending);
  const targetMonthlySpending = monthlyIncome * 0.5;

  const targetAllocation = data.settings?.targetAllocation ?? DEFAULT_ALLOCATION;
  const actionItems = generateActionItems(data);

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
            <h2 className="text-base font-semibold text-white mb-4">收入配置分布</h2>
            {allocation.growth + allocation.stability + allocation.essentials + allocation.rewards > 0 ? (
              <AllocationDonut allocation={allocation} target={targetAllocation} />
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
                尚未设置收入配置
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-white mb-4">支出趋势</h2>
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
