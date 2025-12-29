import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAppStore } from '../store/useAppStore';
import { ROUTES } from '../utils/constants';

export default function IncomePage() {
  const navigate = useNavigate();
  const setMonthlyIncome = useAppStore((state) => state.setMonthlyIncome);
  const [income, setIncome] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const amount = parseFloat(income);
    if (isNaN(amount) || amount <= 0) {
      setError('请输入有效的月收入金额');
      return;
    }

    setMonthlyIncome(amount);
    navigate(ROUTES.ALLOCATION);
  };

  const amount = parseFloat(income) || 0;
  const previewAllocations = {
    growth: amount * 0.25,
    stability: amount * 0.15,
    essentials: amount * 0.5,
    rewards: amount * 0.1,
  };

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">输入月收入</h1>
          <p className="text-purple-100">让我们从了解您的收入开始</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                <p className="text-sm text-gray-700">
                  💡 <strong>提示</strong>: 请输入您的<strong>税后月收入</strong>（到手工资）。这样计算出来的分配金额会更准确。
                </p>
              </div>

              <Input
                type="number"
                label="月收入金额（元）"
                placeholder="请输入您的月收入"
                value={income}
                onChange={(e) => {
                  setIncome(e.target.value);
                  setError('');
                }}
                error={error}
              />

              {amount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl"
                >
                  <h3 className="font-semibold mb-3 text-gray-800">按25-15-50-10法则预览</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">📈 增长投资 (25%)</span>
                      <span className="font-bold text-green-600">¥{previewAllocations.growth.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">🛡️ 稳定基金 (15%)</span>
                      <span className="font-bold text-blue-600">¥{previewAllocations.stability.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">🏠 基本开支 (50%)</span>
                      <span className="font-bold text-orange-600">¥{previewAllocations.essentials.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">🎉 奖励消费 (10%)</span>
                      <span className="font-bold text-pink-600">¥{previewAllocations.rewards.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    下一步您可以自定义这些比例
                  </p>
                </motion.div>
              )}

              <Button onClick={handleSubmit} disabled={!income} className="w-full">
                下一步
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageContainer>
  );
}
