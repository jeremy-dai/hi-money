
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ArrowRight,
  ShieldCheck,
  PieChart,
  Layers,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/common/Button';
import { ROUTES } from '../utils/constants';
import { TextGenerateEffect } from '@/components/ui/text-generate';

export default function WelcomePage() {
  const navigate = useNavigate();

  const features = [
    {
      title: '支出追踪',
      description: '按月记录生活支出，MA-3 移动平均平滑月度波动，自动识别支出异常并提醒。',
      icon: BarChart3,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      title: '资产配置',
      description: '将投资账户按增长、稳健、特殊三类管理，根据年龄、家庭、城市等画像生成个性化配置建议。',
      icon: PieChart,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      title: '保险管理',
      description: '录入保单后自动三维核算：保费计入支出预算，现金价值计入净资产，保额计算家庭抗风险杠杆率。',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      title: '多场景模拟',
      description: '沙盒模式隔离演练 What-if 场景，案例模式参考不同人生阶段的配置策略，真实数据云端同步。',
      icon: Layers,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
  ];

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-20">
          <div className="mb-6">
            <h1 className="text-7xl md:text-8xl font-bold text-white mb-6 glow-gold">
              Hi Money
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-primary"></div>
              <div className="text-3xl text-gold-primary font-light">
                <TextGenerateEffect words="智能财富管理系统" className="text-gold-primary font-light" />
              </div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-primary"></div>
            </div>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              追踪支出、管理资产配置、分析保险保障
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Button
              size="lg"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="w-full md:w-auto min-w-[200px]"
            >
              开始使用
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">为什么选择 Hi Money</h2>
            <p className="text-gray-400">把财务数据变成清晰的决策依据</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 hover:border-white/[0.15] hover:bg-white/[0.04] transition duration-200"
                >
                  <div className={`inline-flex rounded-lg p-2.5 ${item.bg} mb-4`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-200 mb-2">{item.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center py-20 border-t border-white/10">
          <h2 className="text-3xl font-bold mb-6">准备好掌控您的财富了吗？</h2>
          <Button
            size="lg"
            onClick={() => navigate(ROUTES.LOGIN)}
            className="min-w-[200px]"
          >
            立即开启
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
