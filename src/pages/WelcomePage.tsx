import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useAppStore } from '../store/useAppStore';
import { ROUTES } from '../utils/constants';

export default function WelcomePage() {
  const navigate = useNavigate();
  const hasCompletedSetup = useAppStore((state) => state.hasCompletedSetup);

  useEffect(() => {
    if (hasCompletedSetup) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [hasCompletedSetup, navigate]);

  const features = [
    {
      icon: '📈',
      title: '25% 增长投资',
      description: '让钱为你工作，通过复利实现财富增长',
      color: '#10B981',
    },
    {
      icon: '🛡️',
      title: '15% 稳定基金',
      description: '建立应急储备，在危机中保持冷静',
      color: '#3B82F6',
    },
    {
      icon: '🏠',
      title: '50% 基本开支',
      description: '生活必需品，聪明消费不是削减快乐',
      color: '#F59E0B',
    },
    {
      icon: '🎉',
      title: '10% 奖励消费',
      description: '无罪恶感享受生活，保持长期动力',
      color: '#F9A8D4',
    },
  ];

  const benefits = [
    {
      icon: '💰',
      title: '复利的威力',
      text: '20岁开始每月投$200，60岁能积累$126万。30岁开始每月$300只有$67万',
    },
    {
      icon: '🎯',
      title: '智能配置',
      text: 'AI算法自动平衡资产配置，优先分配到under-allocated类别',
    },
    {
      icon: '📊',
      title: '数据可视化',
      text: '实时追踪目标进度，预测达成时间，让财富增长一目了然',
    },
  ];

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">Hi Money</h1>
          <p className="text-2xl text-purple-100 mb-2">智能财富管理系统</p>
          <p className="text-lg text-purple-200">像1%的富人一样管理金钱</p>
        </motion.div>

        {/* What is 25-15-50-10 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card>
            <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-primary bg-clip-text text-transparent">
              什么是25-15-50-10法则？
            </h2>
            <p className="text-gray-700 text-center mb-8 leading-relaxed">
              这是一套经过验证的财富管理框架，帮助任何收入水平的人都能有效管理金钱。
              <br />
              将每月收入按固定比例分配到四个类别，平衡当下与未来。
            </p>
          </Card>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <Card className="hover:transform hover:scale-105 transition-all duration-200 h-full">
                <div className="text-center">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: feature.color }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              为什么选择Hi Money？
            </h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{benefit.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">{benefit.title}</h4>
                    <p className="text-sm text-gray-600">{benefit.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-center"
        >
          <Button size="lg" onClick={() => navigate(ROUTES.INCOME)} className="shadow-2xl">
            开始财富之旅 →
          </Button>
          <p className="text-purple-100 text-sm mt-4">
            只需3步设置，开启智能理财
          </p>
        </motion.div>
      </div>
    </PageContainer>
  );
}
