import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Building2, Rocket, BarChart3, BookOpen, TrendingUp, AlertCircle, Shield, Target, CheckCircle2 } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { WealthCard } from '../components/wealth/WealthCard';
import { PieChart } from '../components/charts/PieChart';
import { NetWorthChart } from '../components/charts/NetWorthChart';
import { useAppStore } from '../store/useAppStore';
import {
  ROUTES,
  INVESTMENT_CATEGORY_NAMES,
  INVESTMENT_CATEGORY_COLORS,
  INVESTMENT_CATEGORY_DESCRIPTIONS,
} from '../utils/constants';
import type { InvestmentCategoryType } from '../types';
import { ScoreBar } from '@/components/common/ScoreBar';
import { GapAlert } from '@/components/common/GapAlert';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { CardSpotlight } from '@/components/ui/card-spotlight';
import { formatCNY } from '@/lib/format';
import React from 'react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    allocation,
    history,
    getCategoryTotal,
    getCategoryPercentage,
    getCategoryDeviation,
    getInsuranceGap,
    getRetirementGap,
    getRecommendedAllocation,
    userProfile,
    insuranceProfile,
    retirementProfile,
  } = useAppStore();

  // Get gap analysis results
  const insuranceGap = getInsuranceGap();
  const retirementGap = getRetirementGap();
  const recommendedAllocation = getRecommendedAllocation();

  // Calculate health metrics scores
  const calculateInvestmentScore = (): number => {
    if (!recommendedAllocation) return 0;
    const investmentCategories: InvestmentCategoryType[] = ['growth', 'stability', 'special'];
    let totalDeviation = 0;
    investmentCategories.forEach((cat) => {
      const current = getCategoryPercentage(cat);
      const target = recommendedAllocation.finalAllocation[cat];
      totalDeviation += Math.abs(current - target);
    });
    // Score: 100 - (average deviation * 2), capped at 0-100
    const avgDeviation = totalDeviation / investmentCategories.length;
    return Math.max(0, Math.min(100, 100 - avgDeviation * 2));
  };

  const calculateInsuranceScore = (): number => {
    if (!insuranceGap) return 0;
    // Use coverageCompleteness as the score
    return Math.min(100, insuranceGap.coverageCompleteness);
  };

  const calculateRetirementScore = (): number => {
    if (!retirementGap || !retirementGap.summary.hasGap) return 100;
    // Score based on gap severity
    const severityMap = { none: 100, small: 75, moderate: 50, large: 25 };
    return severityMap[retirementGap.summary.gapSeverity] || 50;
  };

  const investmentScore = calculateInvestmentScore();
  const insuranceScore = calculateInsuranceScore();
  const retirementScore = calculateRetirementScore();

  // Dashboard shows ONLY investment categories (not spending categories)
  const investmentCategories: InvestmentCategoryType[] = ['growth', 'stability', 'special'];

  // Calculate investment portfolio total (excluding spending)
  const investmentTotal = investmentCategories.reduce(
    (sum, cat) => sum + getCategoryTotal(cat),
    0
  );

  const chartData = investmentCategories.map((category) => ({
    name: INVESTMENT_CATEGORY_NAMES[category],
    value: getCategoryTotal(category),
    color: INVESTMENT_CATEGORY_COLORS[category],
  }));

  // Calculate which categories need rebalancing
  const rebalancingNeeded = investmentCategories.filter(
    (cat) => Math.abs(getCategoryDeviation(cat)) > 5 // More than 5% deviation
  );

  const quickActions = [
    { Icon: Wallet, label: '分配收入', path: ROUTES.ALLOCATE_INCOME },
    { Icon: Building2, label: '管理账户', path: ROUTES.ACCOUNTS },
    { Icon: Rocket, label: '投资指南', path: ROUTES.INVESTMENT_GUIDANCE },
    { Icon: BarChart3, label: '数据分析', path: ROUTES.ANALYTICS },
    { Icon: BookOpen, label: '学习参考', path: ROUTES.WELCOME },
  ];

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto pb-20 pt-10">
        {/* Net Worth Hero Section - using BentoGridItem style manually for full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <CardSpotlight className="bg-gradient-to-br from-black-elevated to-black-soft border-indigo-600/30 p-8 w-full">
            <div>
              <h1 className="text-xl text-gray-400 mb-2">投资组合净值</h1>
              <p className="text-5xl font-bold text-white mb-2 font-mono">
                {formatCNY(investmentTotal)}
              </p>
              <div className="flex items-center gap-2 text-growth">
                <TrendingUp size={20} />
                <span className="text-lg font-semibold">持续增长中</span>
              </div>
            </div>
          </CardSpotlight>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Net Worth Chart */}
            {history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <NetWorthChart history={history} />
                </Card>
              </motion.div>
            )}

            {/* Investment Categories */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">投资分类</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {investmentCategories.map((category, index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <WealthCard
                      type={category}
                      title={INVESTMENT_CATEGORY_NAMES[category]}
                      percentage={getCategoryPercentage(category)}
                      amount={getCategoryTotal(category)}
                      subtitle={INVESTMENT_CATEGORY_DESCRIPTIONS[category]}
                      onClick={() => navigate(`/detail/${category}`)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Rebalancing Insights */}
            {rebalancingNeeded.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-gold-primary/30 bg-gradient-to-br from-black-elevated to-black-soft">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="text-gold-primary shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">再平衡建议</h3>
                      <p className="text-sm text-gray-400">
                        部分投资类别偏离目标配置超过5%
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {rebalancingNeeded.map((category) => {
                      const deviation = getCategoryDeviation(category);
                      const isOver = deviation > 0;
                      return (
                        <div
                          key={category}
                          className="flex items-center justify-between p-3 rounded-lg bg-black-soft"
                        >
                          <div>
                            <p className="font-semibold text-white">
                              {INVESTMENT_CATEGORY_NAMES[category]}
                            </p>
                            <p className="text-sm text-gray-400">
                              实际: {getCategoryPercentage(category).toFixed(1)}% | 目标: {allocation[category]}%
                            </p>
                          </div>
                          <div className={`text-right ${isOver ? 'text-gold-primary' : 'text-stability'}`}>
                            <p className="text-lg font-bold">
                              {isOver ? '+' : ''}{deviation.toFixed(1)}%
                            </p>
                            <p className="text-xs">
                              {isOver ? '超配' : '欠配'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Right Column (1/3) */}
          <div className="space-y-6">
            {/* Pie Chart */}
            {investmentTotal > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <CardSpotlight color="#262626">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">投资分布</h3>
                  <PieChart data={chartData} />
                </CardSpotlight>
              </motion.div>
            )}

            {/* Gap Alerts */}
            {userProfile && insuranceProfile && insuranceGap && insuranceGap.totalGap > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <GapAlert type="insurance" gap={insuranceGap.totalGap} />
              </motion.div>
            )}
            
            {userProfile && retirementProfile && retirementGap && retirementGap.summary.hasGap && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75 }}
              >
                 <GapAlert type="retirement" gap={0} className="border-orange-500/50 bg-orange-500/10" /> 
                 {/* Note: GapAlert component might need adjustment to handle non-amount gaps better or pass severity text */}
                 <div className="mt-2 text-xs text-gray-400">
                    {retirementGap.summary.gapSeverity === 'large'
                      ? '退休缺口较大，需要立即行动'
                      : retirementGap.summary.gapSeverity === 'moderate'
                      ? '退休缺口中等，建议积极规划'
                      : '退休缺口较小，建议小幅调整'}
                 </div>
              </motion.div>
            )}


            {/* Health Metrics */}
            {userProfile && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75 }}
              >
                <CardSpotlight>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-gold-primary" />
                    财务健康度
                  </h3>
                  <div className="space-y-4">
                    <ScoreBar score={Math.round(investmentScore)} label="投资配置" />
                    {insuranceProfile && (
                       <ScoreBar score={Math.round(insuranceScore)} label="保险保障" />
                    )}
                    {retirementProfile && (
                       <ScoreBar score={Math.round(retirementScore)} label="退休准备" />
                    )}
                  </div>
                </CardSpotlight>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card>
                <h3 className="text-lg font-bold text-white mb-4">快捷操作</h3>
                <div className="space-y-2">
                  {quickActions.map((action, index) => {
                    const { Icon } = action;
                    return (
                      <button
                        key={index}
                        onClick={() => navigate(action.path)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-black-soft hover:bg-black-elevated transition-colors text-left group"
                      >
                        <Icon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" strokeWidth={2} />
                        <span className="font-medium text-white">{action.label}</span>
                      </button>
                    );
                  })}
                  {/* Add insurance and retirement planning to quick actions if profiles exist */}
                  {userProfile && insuranceProfile && (
                    <button
                      onClick={() => navigate(ROUTES.INSURANCE_PLANNING)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-black-soft hover:bg-black-elevated transition-colors text-left group"
                    >
                      <Shield className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" strokeWidth={2} />
                      <span className="font-medium text-white">保险规划</span>
                    </button>
                  )}
                  {userProfile && retirementProfile && (
                    <button
                      onClick={() => navigate(ROUTES.RETIREMENT_PLANNING)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-black-soft hover:bg-black-elevated transition-colors text-left group"
                    >
                      <Target className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" strokeWidth={2} />
                      <span className="font-medium text-white">退休规划</span>
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
