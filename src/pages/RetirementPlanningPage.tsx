/**
 * Retirement Planning Page
 * 
 * Full page for retirement gap analysis and planning.
 * Shows pension analysis, corpus requirements, scenario comparisons, and action plans.
 */

import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { RetirementGapChart } from '../components/retirement/RetirementGapChart';
import { useAppStore } from '../store/useAppStore';
import { Target, AlertTriangle, Info } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

export default function RetirementPlanningPage() {
  const navigate = useNavigate();
  const { userProfile, retirementProfile, getTotalAssets, getRetirementGap } = useAppStore();

  const currentSavings = getTotalAssets();
  const gapResult = getRetirementGap();

  // If no profile, redirect to onboarding
  if (!userProfile || !retirementProfile) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gold-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">需要完善个人信息</h2>
              <p className="text-gray-400 mb-6">
                请先完成个人资料和退休信息填写，以便进行退休规划分析。
              </p>
              <Button onClick={() => navigate(ROUTES.WELCOME)}>前往完善资料</Button>
            </div>
          </Card>
        </div>
      </PageContainer>
    );
  }

  // If no gap result (shouldn't happen, but handle gracefully)
  if (!gapResult) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">无法计算退休缺口</h2>
              <p className="text-gray-400">请检查您的个人信息和退休信息是否完整。</p>
            </div>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">退休规划</h1>
          <p className="text-gray-400">
            基于中国养老金替代率（43.6%）和您的个人情况，分析退休资金缺口
          </p>
        </div>

        {/* Alert Banner */}
        {gapResult.summary.hasGap && (
          <Card
            className="mb-6 border-amber-500/50 bg-amber-500/10"
            style={{
              borderColor:
                gapResult.summary.gapSeverity === 'large'
                  ? '#EF4444'
                  : gapResult.summary.gapSeverity === 'moderate'
                  ? '#F97316'
                  : '#F59E0B',
            }}
          >
            <div className="flex items-start gap-4">
              <AlertTriangle
                className="w-6 h-6 flex-shrink-0 mt-1"
                style={{
                  color:
                    gapResult.summary.gapSeverity === 'large'
                      ? '#EF4444'
                      : gapResult.summary.gapSeverity === 'moderate'
                      ? '#F97316'
                      : '#F59E0B',
                }}
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {gapResult.summary.gapSeverity === 'large'
                    ? '退休缺口较大'
                    : gapResult.summary.gapSeverity === 'moderate'
                    ? '退休缺口中等'
                    : '退休缺口较小'}
                </h3>
                <p className="text-gray-300">{gapResult.summary.keyMessage}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Success Banner */}
        {!gapResult.summary.hasGap && (
          <Card className="mb-6 border-green-500/50 bg-green-500/10">
            <div className="flex items-start gap-4">
              <Target className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">退休规划良好</h3>
                <p className="text-gray-300">恭喜！您的退休准备处于良好状态，继续保持。</p>
              </div>
            </div>
          </Card>
        )}

        {/* Info Banner */}
        <Card className="mb-6 border-blue-500/50 bg-blue-500/10">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">计算说明</h3>
              <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                <li>中国养老金替代率：43.6%（基于 40 年缴费）</li>
                <li>建议退休收入：当前收入的 70%</li>
                <li>资金提取率：3.5%（年提取率）</li>
                <li>实际回报率：3%（扣除 3% 通胀后的实际回报）</li>
                <li>当前储蓄：¥{(currentSavings / 10000).toFixed(1)}万</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Main Chart Component */}
        <RetirementGapChart result={gapResult} />

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button onClick={() => navigate(ROUTES.DASHBOARD)} variant="secondary">
            返回首页
          </Button>
          <Button onClick={() => navigate(ROUTES.INSURANCE_PLANNING)}>
            查看保险规划
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

