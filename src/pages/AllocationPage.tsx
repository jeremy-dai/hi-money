import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { AllocationSlider } from '../components/wealth/AllocationSlider';
import { useAppStore } from '../store/useAppStore';
import { autoAdjustAllocation } from '../algorithms/autoAdjustSliders';
import { ROUTES, CATEGORY_NAMES, CATEGORY_DESCRIPTIONS } from '../utils/constants';
import type { Allocation, CategoryType } from '../types';

export default function AllocationPage() {
  const navigate = useNavigate();
  const storeAllocation = useAppStore((state) => state.allocation);
  const setAllocation = useAppStore((state) => state.setAllocation);
  const [allocation, setLocalAllocation] = useState<Allocation>(storeAllocation);
  const [currentlyChanging, setCurrentlyChanging] = useState<CategoryType | null>(null);

  const handleSliderChange = (category: CategoryType, value: number) => {
    setCurrentlyChanging(category);
    const newAllocation = autoAdjustAllocation(allocation, category, value);
    setLocalAllocation(newAllocation);
  };

  const handleConfirm = () => {
    setAllocation(allocation);
    navigate(ROUTES.GOAL);
  };

  const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">自定义分配比例</h1>
          <p className="text-purple-100">调整您的财富配置策略</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <div className="space-y-8">
              {(Object.keys(allocation) as CategoryType[]).map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AllocationSlider
                    category={category}
                    label={CATEGORY_NAMES[category]}
                    value={allocation[category]}
                    description={CATEGORY_DESCRIPTIONS[category]}
                    onChange={(value) => handleSliderChange(category, value)}
                    isChanging={currentlyChanging === category}
                  />
                </motion.div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">总计</span>
                  <span className={`text-2xl font-bold ${total === 100 ? 'text-green-500' : 'text-red-500'}`}>
                    {total}%
                  </span>
                </div>

                <Button onClick={handleConfirm} disabled={total !== 100} className="w-full">
                  确认配置
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageContainer>
  );
}
