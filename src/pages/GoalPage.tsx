import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAppStore } from '../store/useAppStore';
import { ROUTES, CATEGORY_NAMES, CATEGORY_COLORS } from '../utils/constants';
import type { CategoryType } from '../types';

export default function GoalPage() {
  const navigate = useNavigate();
  const { setGoal, completeSetup, allocation, addHistory } = useAppStore();
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const handleSubmit = () => {
    const amount = parseFloat(targetAmount);
    if (!goalName || isNaN(amount) || amount <= 0) {
      return;
    }

    setGoal({
      name: goalName,
      totalAmount: amount,
      createdAt: new Date().toISOString(),
    });

    // Add initial history record
    addHistory('initial');

    // Complete setup
    completeSetup();

    navigate(ROUTES.DASHBOARD);
  };

  const amount = parseFloat(targetAmount) || 0;
  const categories: CategoryType[] = ['growth', 'stability', 'essentials', 'rewards'];

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">设定财富目标</h1>
          <p className="text-purple-100">为您的未来设定一个明确的目标</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <p className="text-sm text-gray-700">
                  💡 <strong>建议</strong>: 设定一个5-10年内的中期目标，如房子首付、创业基金、财务自由等。
                </p>
              </div>

              <Input
                label="目标名称"
                placeholder="例如：房子首付、创业基金、财务自由"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />

              <Input
                type="number"
                label="目标金额（元）"
                placeholder="请输入目标金额"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />

              {amount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6"
                >
                  <div className="p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl">
                    <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      各类别目标金额分配
                    </h3>

                    <div className="space-y-4">
                      {categories.map((category) => {
                        const percentage = allocation[category];
                        const categoryAmount = (amount * percentage) / 100;
                        const color = CATEGORY_COLORS[category];

                        return (
                          <motion.div
                            key={category}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: categories.indexOf(category) * 0.1 }}
                            className="bg-white rounded-xl p-4 shadow-sm"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-800">
                                {CATEGORY_NAMES[category]}
                              </span>
                              <span className="text-sm text-gray-500">{percentage}%</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, delay: categories.indexOf(category) * 0.1 }}
                                className="absolute h-full rounded-full"
                                style={{ background: color }}
                              />
                            </div>

                            <div className="flex justify-between items-center">
                              <span
                                className="text-2xl font-bold"
                                style={{ color }}
                              >
                                ¥{categoryAmount.toFixed(2)}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="mt-6 p-4 bg-white rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">总目标金额</span>
                        <span className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                          ¥{amount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-4 text-center">
                      根据您设定的 {allocation.growth}-{allocation.stability}-{allocation.essentials}-{allocation.rewards} 比例分配
                    </p>
                  </div>
                </motion.div>
              )}

              <Button onClick={handleSubmit} disabled={!goalName || !targetAmount} className="w-full">
                完成设置，开启财富之旅 →
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageContainer>
  );
}
