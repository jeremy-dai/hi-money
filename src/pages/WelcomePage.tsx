
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Target,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Layout,
  Layers,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/common/Button';
import { ROUTES } from '../utils/constants';
import { TextGenerateEffect } from '@/components/ui/text-generate';
import { HoverEffect } from '@/components/ui/hover-effect';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';

export default function WelcomePage() {
  const navigate = useNavigate();

  const investmentCategories = [
    {
      title: '成长投资 (25%)',
      description: '股票、ETF等高增长资产。例如：指数基金、优质股票、成长型ETF',
      link: '#',
    },
    {
      title: '稳健储蓄 (15%)',
      description: '债券与应急储备。例如：应急基金、债券基金、定期存款',
      link: '#',
    },
    {
      title: '基本开支 (50%)',
      description: '生活必需品与固定支出。例如：房租、食品、水电、交通',
      link: '#',
    },
    {
      title: '享乐奖励 (10%)',
      description: '无罪恶感享受生活。例如：旅行、娱乐、兴趣爱好',
      link: '#',
    },
  ];

  const benefits = [
    {
      title: '三重工作区架构',
      description: '个人模式(云端存储)、案例模式(学习参考)、沙盒模式(隔离演练)。数据安全隔离，满足不同场景需求。',
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/10" />,
      icon: <Layout className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: '保险三重调度',
      description: '独创的三重调度机制：保费计入支出，现金价值计入资产，保额计入抗风险杠杆。一份保单，三维评估。',
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/10" />,
      icon: <Layers className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: '可视化追踪',
      description: '实时追踪投资进度，预测目标达成时间，让每一分钱的增长都清晰可见。MA-3 移动平均平滑支出波动。',
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/10" />,
      icon: <BarChart3 className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: '云端安全存储',
      description: '基于 Supabase 构建，企业级数据安全。支持多端同步，随时随地掌控财务状况。',
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/10" />,
      icon: <ShieldCheck className="h-4 w-4 text-neutral-500" />,
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
              基于 "I Will Teach You To Be Rich" 理念，助您轻松掌控财务自由
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

        {/* Categories Section */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">核心投资策略</h2>
            <p className="text-gray-400">科学的 25-15-50-10 资产配置比例，让财富稳健增长</p>
          </div>
          
          <HoverEffect items={investmentCategories} />
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">为什么选择 Hi Money</h2>
            <p className="text-gray-400">不仅仅是记账，更是一套完整的财富增长体系</p>
          </div>

          <BentoGrid className="max-w-4xl mx-auto">
            {benefits.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={i === 3 || i === 6 ? "md:col-span-2" : ""}
              />
            ))}
          </BentoGrid>
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
