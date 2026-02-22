/**
 * Profile Form Component
 * 
 * 4-step onboarding form for collecting user profile information:
 * Step 1: Demographics (age, city tier, family status)
 * Step 2: Financial (income, mortgage, insurance)
 * Step 3: Recommendation (AI-generated, read-only display)
 * Step 4: Goals (retirement age, risk tolerance)
 */

import { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import type { UserProfile, CityTier, MaritalStatus, RiskTolerance, PrimaryGoal } from '../../types/profile.types';
import type { AllocationRecommendation } from '../../types/allocation.types';
import { calculateRecommendedAllocation } from '../../algorithms/recommendAllocation';

interface ProfileFormProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: Partial<UserProfile>;
}

export function ProfileForm({ onComplete, initialProfile }: ProfileFormProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    age: 30,
    cityTier: 1,
    maritalStatus: 'single',
    hasChildren: false,
    childrenCount: 0,
    childrenAges: [],
    monthlyIncome: 0,
    hasMortgage: false,
    mortgageMonthly: undefined,
    existingDebts: 0,
    riskTolerance: 'moderate',
    primaryGoal: 'wealth',
    retirementAge: 60,
    profileCompleted: false,
    lastUpdated: new Date().toISOString(),
    ...initialProfile,
  });

  const [recommendation, setRecommendation] = useState<AllocationRecommendation | null>(null);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (step === 2) {
      // Calculate recommendation after step 2
      const tempProfile = profile as UserProfile;
      if (tempProfile.age && tempProfile.cityTier && tempProfile.monthlyIncome) {
        const rec = calculateRecommendedAllocation(tempProfile);
        setRecommendation(rec);
      }
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      const finalProfile: UserProfile = {
        age: profile.age!,
        cityTier: profile.cityTier!,
        maritalStatus: profile.maritalStatus!,
        hasChildren: profile.hasChildren || false,
        childrenCount: profile.childrenCount || 0,
        childrenAges: profile.childrenAges || [],
        monthlyIncome: profile.monthlyIncome!,
        hasMortgage: profile.hasMortgage || false,
        mortgageMonthly: profile.mortgageMonthly,
        existingDebts: profile.existingDebts || 0,
        riskTolerance: profile.riskTolerance!,
        primaryGoal: profile.primaryGoal!,
        retirementAge: profile.retirementAge!,
        profileCompleted: true,
        lastUpdated: new Date().toISOString(),
      };
      onComplete(finalProfile);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return profile.age && profile.age > 0 && profile.cityTier && profile.maritalStatus;
      case 2:
        return profile.monthlyIncome && profile.monthlyIncome > 0;
      case 3:
        return recommendation !== null;
      case 4:
        return profile.retirementAge && profile.retirementAge > 0 && profile.riskTolerance;
      default:
        return false;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s
                    ? 'bg-gold-primary text-black-primary'
                    : 'bg-black-soft text-gray-600 border-2 border-black-border'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    step > s ? 'bg-gold-primary' : 'bg-black-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {step === 1 && '基本信息'}
            {step === 2 && '财务状况'}
            {step === 3 && '推荐配置'}
            {step === 4 && '目标设定'}
          </h2>
          <p className="text-gray-400">
            {step === 1 && '告诉我们一些关于您的基本信息'}
            {step === 2 && '了解您的收入和支出情况'}
            {step === 3 && '基于您的信息生成的个性化推荐'}
            {step === 4 && '设定您的财务目标和风险偏好'}
          </p>
        </div>
      </div>

      <Card className="p-8">
        {/* Step 1: Demographics */}
        {step === 1 && (
          <div className="space-y-6">
            <Input
              label="年龄"
              type="number"
              min="18"
              max="100"
              value={profile.age || ''}
              onChange={(e) => updateProfile({ age: parseInt(e.target.value) || 0 })}
            />

            <div>
              <label className="block text-sm font-medium text-white-soft mb-2">城市等级</label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-black-border bg-black-soft text-white focus:outline-none focus:ring-2 focus:ring-gold-primary"
                value={profile.cityTier || 1}
                onChange={(e) => updateProfile({ cityTier: parseInt(e.target.value) as CityTier })}
              >
                <option value={1}>一线城市（北京、上海、广州、深圳）</option>
                <option value={2}>二线城市（省会城市、主要城市）</option>
                <option value={3}>三线城市（地级市）</option>
                <option value={4}>四线城市（县级市及以下）</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white-soft mb-2">婚姻状况</label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-black-border bg-black-soft text-white focus:outline-none focus:ring-2 focus:ring-gold-primary"
                value={profile.maritalStatus || 'single'}
                onChange={(e) => {
                  const status = e.target.value as MaritalStatus;
                  updateProfile({
                    maritalStatus: status,
                    hasChildren: status === 'single' ? false : profile.hasChildren,
                  });
                }}
              >
                <option value="single">单身</option>
                <option value="married">已婚</option>
                <option value="divorced">离异</option>
              </select>
            </div>

            {profile.maritalStatus === 'married' && (
              <>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-white-soft">
                    <input
                      type="checkbox"
                      checked={profile.hasChildren || false}
                      onChange={(e) =>
                        updateProfile({
                          hasChildren: e.target.checked,
                          childrenCount: e.target.checked ? profile.childrenCount || 1 : 0,
                          childrenAges: e.target.checked ? profile.childrenAges || [] : [],
                        })
                      }
                      className="w-5 h-5 rounded border-black-border bg-black-soft text-gold-primary focus:ring-gold-primary"
                    />
                    <span>有子女</span>
                  </label>
                </div>

                {profile.hasChildren && (
                  <>
                    <Input
                      label="子女数量"
                      type="number"
                      min="1"
                      max="10"
                      value={profile.childrenCount || ''}
                      onChange={(e) => {
                        const count = parseInt(e.target.value) || 0;
                        updateProfile({
                          childrenCount: count,
                          childrenAges: Array(count).fill(0),
                        });
                      }}
                    />
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 2: Financial */}
        {step === 2 && (
          <div className="space-y-6">
            <Input
              label="月收入（元）"
              type="number"
              min="0"
              value={profile.monthlyIncome || ''}
              onChange={(e) => updateProfile({ monthlyIncome: parseFloat(e.target.value) || 0 })}
            />

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-white-soft">
                <input
                  type="checkbox"
                  checked={profile.hasMortgage || false}
                  onChange={(e) =>
                    updateProfile({
                      hasMortgage: e.target.checked,
                      mortgageMonthly: e.target.checked ? profile.mortgageMonthly : undefined,
                    })
                  }
                  className="w-5 h-5 rounded border-black-border bg-black-soft text-gold-primary focus:ring-gold-primary"
                />
                <span>有房贷</span>
              </label>
            </div>

            {profile.hasMortgage && (
              <Input
                label="月供（元）"
                type="number"
                min="0"
                value={profile.mortgageMonthly || ''}
                onChange={(e) =>
                  updateProfile({ mortgageMonthly: parseFloat(e.target.value) || undefined })
                }
              />
            )}

            <Input
              label="现有债务（元）"
              type="number"
              min="0"
              value={profile.existingDebts || ''}
              onChange={(e) => updateProfile({ existingDebts: parseFloat(e.target.value) || 0 })}
            />
          </div>
        )}

        {/* Step 3: Recommendation */}
        {step === 3 && recommendation && (
          <div className="space-y-6">
            <div className="bg-black-soft rounded-lg p-6 border border-gold-primary/20">
              <h3 className="text-xl font-bold text-gold-primary mb-4">推荐配置</h3>
              <p className="text-gray-300 mb-6">{recommendation.rationale.summary}</p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">收入分配</h4>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex justify-between">
                      <span>投资池</span>
                      <span className="text-gold-primary font-bold">
                        {recommendation.incomeAllocation.investmentPool}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>生活必需</span>
                      <span>{recommendation.incomeAllocation.essentials}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>享乐奖励</span>
                      <span>{recommendation.incomeAllocation.rewards}%</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-black-border pt-4">
                  <h4 className="text-white font-semibold mb-2">投资池分配</h4>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex justify-between">
                      <span>成长投资</span>
                      <span className="text-gold-primary font-bold">
                        {recommendation.investmentAllocation.growth}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>稳健储蓄</span>
                      <span>{recommendation.investmentAllocation.stability}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>特殊用途</span>
                      <span>{recommendation.investmentAllocation.special}%</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-black-border pt-4">
                  <h4 className="text-white font-semibold mb-2">影响因素</h4>
                  <div className="space-y-2">
                    {recommendation.rationale.factors.map((factor, idx) => (
                      <div key={idx} className="text-sm text-gray-400">
                        <span className="text-gold-primary">{factor.name}</span>: {factor.impact}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Goals */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white-soft mb-2">风险偏好</label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-black-border bg-black-soft text-white focus:outline-none focus:ring-2 focus:ring-gold-primary"
                value={profile.riskTolerance || 'moderate'}
                onChange={(e) => updateProfile({ riskTolerance: e.target.value as RiskTolerance })}
              >
                <option value="conservative">保守型 - 偏好低风险稳定收益</option>
                <option value="moderate">稳健型 - 平衡风险与收益</option>
                <option value="aggressive">进取型 - 偏好高风险高收益</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white-soft mb-2">主要目标</label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-black-border bg-black-soft text-white focus:outline-none focus:ring-2 focus:ring-gold-primary"
                value={profile.primaryGoal || 'wealth'}
                onChange={(e) => updateProfile({ primaryGoal: e.target.value as PrimaryGoal })}
              >
                <option value="retirement">退休规划</option>
                <option value="house">购房</option>
                <option value="education">教育基金</option>
                <option value="wealth">财富增长</option>
                <option value="security">财务安全</option>
              </select>
            </div>

            <Input
              label="目标退休年龄"
              type="number"
              min="50"
              max="70"
              value={profile.retirementAge || ''}
              onChange={(e) => updateProfile({ retirementAge: parseInt(e.target.value) || 60 })}
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
            上一步
          </Button>
          <Button variant="primary" onClick={handleNext} disabled={!canProceed()}>
            {step === 4 ? '完成' : '下一步'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

