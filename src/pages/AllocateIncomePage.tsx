import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAppStore } from '../store/useAppStore';
import { calculateFixedAllocation, calculateSmartAllocation } from '../algorithms/smartAllocation';
import { CATEGORY_NAMES, CATEGORY_COLORS } from '../utils/constants';
import type { CategoryType } from '../types';

export default function AllocateIncomePage() {
  const navigate = useNavigate();
  const {
    allocation,
    getCategoryTotal,
    getCategoryPercentage,
    getCategoryDeviation,
    addAccount,
    addHistory,
  } = useAppStore();

  const [income, setIncome] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'A' | 'B'>('A');

  const amount = parseFloat(income) || 0;

  // Phase 4: Only investment categories (essentials/rewards are spent, not tracked)
  const currentStatus = {
    growth: {
      amount: getCategoryTotal('growth'),
      percentage: getCategoryPercentage('growth'),
      deviation: getCategoryDeviation('growth'),
    },
    stability: {
      amount: getCategoryTotal('stability'),
      percentage: getCategoryPercentage('stability'),
      deviation: getCategoryDeviation('stability'),
    },
    special: {
      amount: getCategoryTotal('special'),
      percentage: getCategoryPercentage('special'),
      deviation: getCategoryDeviation('special'),
    },
    essentials: {
      amount: 0, // Not tracked
      percentage: 0,
      deviation: 0,
    },
    rewards: {
      amount: 0, // Not tracked
      percentage: 0,
      deviation: 0,
    },
  };

  const planA = calculateFixedAllocation(amount, allocation);
  const planB = calculateSmartAllocation(amount, currentStatus, allocation);

  const handleAllocate = () => {
    if (amount <= 0) return;

    const plan = selectedPlan === 'A' ? planA : planB;

    // Add to accounts (only investment categories - Phase 4)
    const investmentCategories: CategoryType[] = ['growth', 'stability', 'special'];
    investmentCategories.forEach((category) => {
      if (plan[category] > 0) {
        addAccount(category, {
          name: `收入分配-${new Date().toLocaleDateString()}`,
          amount: plan[category],
        });
      }
    });

    // Add to history
    addHistory('income', amount, allocation);

    alert('收入分配成功！');
    navigate(-1);
  };

  // Phase 4: Only investment categories (essentials/rewards are spent, not tracked)
  const categories: CategoryType[] = ['growth', 'stability', 'special'];

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">分配收入</h1>
          <p className="text-white-soft">智能分配您的新收入到投资账户</p>
        </div>

        {/* Info Banner - Phase 4: Educational note about essentials/rewards */}
        <Card className="mb-6 bg-gradient-to-r from-gold-primary/10 to-gold-primary/5 border-gold-primary/30">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-1">关于生活开支和奖励消费</p>
              <p className="text-gray-400 text-sm">基本开支（Essentials）和奖励消费（Rewards）是您每月的生活支出，无需在 Hi Money 中追踪。本页面仅分配投资资金到增长投资、稳定基金和特殊用途账户。</p>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <Input
            type="number"
            label="收入金额（元）"
            placeholder="请输入本次收入"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
        </Card>

        {amount > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Plan A */}
              <Card
                onClick={() => setSelectedPlan('A')}
                className={`cursor-pointer border-2 ${selectedPlan === 'A' ? 'border-primary-500' : 'border-transparent'}`}
              >
                <h3 className="text-xl font-bold mb-4">方案A：固定比例</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex justify-between">
                      <span>{CATEGORY_NAMES[category]}</span>
                      <span style={{ color: CATEGORY_COLORS[category] }} className="font-semibold">
                        ¥{planA[category].toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Plan B */}
              <Card
                onClick={() => setSelectedPlan('B')}
                className={`cursor-pointer border-2 ${selectedPlan === 'B' ? 'border-primary-500' : 'border-transparent'}`}
              >
                <h3 className="text-xl font-bold mb-4">方案B：智能平衡</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex justify-between">
                      <span>{CATEGORY_NAMES[category]}</span>
                      <span style={{ color: CATEGORY_COLORS[category] }} className="font-semibold">
                        ¥{planB[category].toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-4">根据当前偏离度智能调整</p>
              </Card>
            </div>

            <Button onClick={handleAllocate} className="w-full">
              确认分配
            </Button>
          </>
        )}
      </div>
    </PageContainer>
  );
}
