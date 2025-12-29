import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PieChart } from '../components/charts/PieChart';
import { useAppStore } from '../store/useAppStore';
import { calculatePrediction } from '../algorithms/prediction';
import { CATEGORY_NAMES, CATEGORY_COLORS } from '../utils/constants';
import type { CategoryType } from '../types';

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { goal, history, getCategoryTotal, getTotalAssets, getCategoryPercentage } = useAppStore();

  const totalAssets = getTotalAssets();
  const categories: CategoryType[] = ['growth', 'stability', 'essentials', 'rewards'];

  const chartData = categories.map((category) => ({
    name: CATEGORY_NAMES[category],
    value: getCategoryTotal(category),
    color: CATEGORY_COLORS[category],
  }));

  const prediction = calculatePrediction(goal.totalAmount, totalAssets, history);

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">数据分析</h1>
          <p className="text-purple-100">洞察您的财富增长</p>
        </div>

        {/* Goal Progress */}
        <Card className="mb-6">
          <h2 className="text-2xl font-bold mb-4">目标进度</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">目标金额</p>
              <p className="text-2xl font-bold">¥{goal.totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600">当前资产</p>
              <p className="text-2xl font-bold text-primary-500">¥{totalAssets.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Asset Distribution */}
        <Card className="mb-6">
          <h2 className="text-2xl font-bold mb-4">资产分布</h2>
          {totalAssets > 0 ? (
            <>
              <PieChart data={chartData} />
              <div className="mt-6 space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex justify-between items-center">
                    <span>{CATEGORY_NAMES[category]}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">¥{getCategoryTotal(category).toFixed(2)}</span>
                      <span style={{ color: CATEGORY_COLORS[category] }} className="font-bold">
                        {getCategoryPercentage(category)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-8">暂无数据</p>
          )}
        </Card>

        {/* Prediction */}
        <Card className="mb-6">
          <h2 className="text-2xl font-bold mb-4">目标预测</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <p className="text-gray-600 mb-2">预计月数</p>
              <p className="text-3xl font-bold text-primary-500">{prediction.monthsNeeded}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <p className="text-gray-600 mb-2">预计达成日期</p>
              <p className="text-lg font-bold">{prediction.estimatedDate}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <p className="text-gray-600 mb-2">月均增长</p>
              <p className="text-2xl font-bold text-green-500">¥{prediction.monthlyGrowthRate}</p>
            </div>
          </div>
        </Card>

        <Button onClick={() => navigate(-1)} className="w-full">
          返回仪表盘
        </Button>
      </div>
    </PageContainer>
  );
}
