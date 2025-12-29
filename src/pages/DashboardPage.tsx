import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { WealthCard } from '../components/wealth/WealthCard';
import { ProgressBar } from '../components/charts/ProgressBar';
import { PieChart } from '../components/charts/PieChart';
import { useAppStore } from '../store/useAppStore';
import { ROUTES, CATEGORY_NAMES, CATEGORY_COLORS, CATEGORY_DESCRIPTIONS } from '../utils/constants';
import type { CategoryType } from '../types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    goal,
    getCategoryTotal,
    getTotalAssets,
    getCategoryPercentage,
  } = useAppStore();

  const totalAssets = getTotalAssets();
  const categories: CategoryType[] = ['growth', 'stability', 'essentials', 'rewards'];

  const chartData = categories.map((category) => ({
    name: CATEGORY_NAMES[category],
    value: getCategoryTotal(category),
    color: CATEGORY_COLORS[category],
  }));

  const quickActions = [
    { icon: '💸', label: '分配收入', path: ROUTES.ALLOCATE_INCOME },
    { icon: '🏦', label: '管理账户', path: ROUTES.ACCOUNTS },
    { icon: '🚀', label: '投资指南', path: ROUTES.INVESTMENT_GUIDANCE },
    { icon: '📊', label: '数据分析', path: ROUTES.ANALYTICS },
    { icon: '⚙️', label: '设置', path: ROUTES.WELCOME },
  ];

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">财富仪表盘</h1>
          <p className="text-purple-100">总资产：¥{totalAssets.toFixed(2)}</p>
        </motion.div>

        {/* Goal Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <Card>
            <h2 className="text-2xl font-bold mb-4">目标：{goal.name || '未设置'}</h2>
            <ProgressBar current={totalAssets} target={goal.totalAmount} />
          </Card>
        </motion.div>

        {/* Wealth Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {categories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <WealthCard
                type={category}
                title={CATEGORY_NAMES[category]}
                percentage={getCategoryPercentage(category)}
                amount={getCategoryTotal(category)}
                subtitle={CATEGORY_DESCRIPTIONS[category]}
                onClick={() => navigate(`/detail/${category}`)}
              />
            </motion.div>
          ))}
        </div>

        {/* Pie Chart */}
        {totalAssets > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mb-8">
            <Card>
              <h3 className="text-xl font-bold mb-4 text-center">资产分布</h3>
              <PieChart data={chartData} />
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                onClick={() => navigate(action.path)}
                hoverable
                className="text-center py-6 cursor-pointer"
              >
                <div className="text-4xl mb-2">{action.icon}</div>
                <div className="font-semibold text-gray-800">{action.label}</div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
}
