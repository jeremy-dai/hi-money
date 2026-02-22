/**
 * Presentation Mode Component
 * 
 * Full-screen presentation mode for insurance advisors to demonstrate
 * the platform. Shows slides with profile, allocation, insurance, and retirement data.
 */

import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ChevronLeft, ChevronRight, X, Presentation as PresentationIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

export function PresentationMode() {
  const navigate = useNavigate();
  const { visitorScenario, userProfile, getRecommendedAllocation, getInsuranceGap, getRetirementGap, deactivateVisitorMode } = useAppStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Exit if no scenario
  useEffect(() => {
    if (!visitorScenario) {
      navigate(ROUTES.VISITOR);
    }
  }, [visitorScenario, navigate]);

  if (!visitorScenario || !userProfile) {
    return null;
  }

  const allocation = getRecommendedAllocation();
  const insuranceGap = getInsuranceGap();
  const retirementGap = getRetirementGap();

  const slides = [
    {
      id: 'profile',
      title: '用户画像',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 mb-2">年龄</p>
              <p className="text-3xl font-bold text-gold-primary">{userProfile.age}岁</p>
            </div>
            <div>
              <p className="text-gray-400 mb-2">月收入</p>
              <p className="text-3xl font-bold text-gold-primary">¥{userProfile.monthlyIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-2">城市</p>
              <p className="text-2xl font-semibold text-white">
                {userProfile.cityTier === 1 ? '一线城市' : 
                 userProfile.cityTier === 2 ? '二线城市' :
                 userProfile.cityTier === 3 ? '三线城市' : '四线城市'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-2">家庭状况</p>
              <p className="text-2xl font-semibold text-white">
                {userProfile.maritalStatus === 'single' ? '单身' : 
                 userProfile.maritalStatus === 'married' ? '已婚' : '离异'}
                {userProfile.hasChildren && ` · ${userProfile.childrenCount}孩`}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'allocation',
      title: '推荐资产配置',
      content: allocation ? (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <p className="text-gray-400 mb-2">基于您的个人情况，我们推荐以下配置</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-gold-primary mb-2">
                {allocation.finalAllocation.growth}%
              </p>
              <p className="text-xl text-white">增长投资</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-gold-primary mb-2">
                {allocation.finalAllocation.stability}%
              </p>
              <p className="text-xl text-white">稳健储蓄</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-gold-primary mb-2">
                {allocation.finalAllocation.special}%
              </p>
              <p className="text-xl text-white">特殊用途</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400">加载中...</div>
      ),
    },
    {
      id: 'insurance',
      title: '保险保障分析',
      content: insuranceGap ? (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <p className="text-gray-400 mb-2">您的保险保障缺口分析</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {insuranceGap.recommendations.slice(0, 4).map((rec) => (
              <div key={rec.type} className="text-center">
                <p className="text-3xl font-bold text-gold-primary mb-2">
                  ¥{(rec.gap / 10000).toFixed(1)}万
                </p>
                <p className="text-lg text-white">{rec.name}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {rec.priority === 'high' ? '高优先级' : 
                   rec.priority === 'medium' ? '中优先级' : '低优先级'}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400">暂无保险数据</div>
      ),
    },
    {
      id: 'retirement',
      title: '退休规划',
      content: retirementGap ? (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <p className="text-gray-400 mb-2">距离退休还有 {retirementGap.yearsToRetirement} 年</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-gray-400 mb-2">预计养老金</p>
              <p className="text-3xl font-bold text-gold-primary">
                ¥{retirementGap.pension.estimatedMonthlyPension.toLocaleString()}/月
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 mb-2">目标收入</p>
              <p className="text-3xl font-bold text-gold-primary">
                ¥{retirementGap.desiredMonthlyIncome.toLocaleString()}/月
              </p>
            </div>
            <div className="text-center col-span-2">
              <p className="text-gray-400 mb-2">建议月储蓄</p>
              <p className="text-4xl font-bold text-gold-primary">
                ¥{retirementGap.actionPlan.monthlySavingsTarget.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400">暂无退休数据</div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleExit = () => {
    deactivateVisitorMode();
    navigate(ROUTES.VISITOR);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') handleExit();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  const currentSlideData = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-black-primary z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-black-border">
        <div className="flex items-center gap-4">
          <PresentationIcon className="w-6 h-6 text-gold-primary" />
          <h1 className="text-xl font-bold text-white">演示模式</h1>
          <span className="text-gray-400 text-sm">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleExit}>
          <X className="w-4 h-4 mr-2" />
          退出
        </Button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex items-center justify-center p-12">
        <Card className="max-w-5xl w-full">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">
            {currentSlideData.title}
          </h2>
          <div className="min-h-[400px] flex items-center justify-center">
            {currentSlideData.content}
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-6 border-t border-black-border">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          上一页
        </Button>
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-gold-primary w-8'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          onClick={handleNext}
          disabled={currentSlide === slides.length - 1}
        >
          下一页
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

