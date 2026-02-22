/**
 * Insurance Planning Page
 * 
 * Full page for insurance gap analysis and planning.
 * Shows coverage gaps, priority recommendations, and family allocation.
 */

import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { InsuranceGapChart } from '../components/insurance/InsuranceGapChart';
import { useAppStore } from '../store/useAppStore';
import { Shield, AlertTriangle, Info } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

export default function InsurancePlanningPage() {
  const navigate = useNavigate();
  const { userProfile, insuranceProfile, getInsuranceGap } = useAppStore();

  const gapResult = getInsuranceGap();

  // If no profile, redirect to onboarding
  if (!userProfile || !insuranceProfile) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gold-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">需要完善个人信息</h2>
              <p className="text-gray-400 mb-6">
                请先完成个人资料和保险信息填写，以便进行保障缺口分析。
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
              <h2 className="text-2xl font-bold text-white mb-4">无法计算保障缺口</h2>
              <p className="text-gray-400">请检查您的个人信息和保险信息是否完整。</p>
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
          <h1 className="text-3xl font-bold text-white mb-2">保险规划</h1>
          <p className="text-gray-400">基于您的个人情况，分析保障缺口并提供专业建议</p>
        </div>

        {/* Alert Banner */}
        {gapResult.totalGap > 0 && (
          <Card className="mb-6 border-amber-500/50 bg-amber-500/10">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">发现保障缺口</h3>
                <p className="text-gray-300">
                  您的总保障缺口为{' '}
                  <span className="font-bold text-amber-500">
                    ¥{(gapResult.totalGap / 10000).toFixed(1)}万
                  </span>
                  ，建议尽快完善保障配置。
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Info Banner */}
        <Card className="mb-6 border-blue-500/50 bg-blue-500/10">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">保障规划原则</h3>
              <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                <li>医疗险和意外险是基础保障，建议优先配置</li>
                <li>有家庭责任时，重疾险和寿险尤为重要</li>
                <li>保费预算建议控制在年收入的 5-10%</li>
                <li>家庭保障分配遵循 6:3:1 原则（主要收入者:次要收入者:子女）</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Main Chart Component */}
        <InsuranceGapChart result={gapResult} />

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button onClick={() => navigate(ROUTES.DASHBOARD)} variant="secondary">
            返回首页
          </Button>
          <Button onClick={() => navigate(ROUTES.RETIREMENT_PLANNING)}>
            查看退休规划
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

