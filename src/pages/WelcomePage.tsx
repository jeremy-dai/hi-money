import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Shield,
  Sparkles,
  DollarSign,
  Target,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ROUTES } from '../utils/constants';
import { TextGenerateEffect } from '@/components/ui/text-generate';
import { HoverEffect } from '@/components/ui/hover-effect';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import React from 'react';

export default function WelcomePage() {
  const navigate = useNavigate();

  const investmentCategories = [
    {
      title: '成长投资 (60%)',
      description: '股票、ETF等高增长资产。例如：指数基金、优质股票、成长型ETF',
      link: '#',
    },
    {
      title: '稳健储蓄 (25%)',
      description: '债券与应急储备。例如：应急基金、债券基金、定期存款',
      link: '#',
    },
    {
      title: '特殊用途 (15%)',
      description: '教育、机会、其他目标。例如：教育基金、机会投资、特别储蓄',
      link: '#',
    },
  ];

  const benefits = [
    {
      title: '复利的魔力',
      description: '20岁开始每月投资¥2000，到60岁约有¥380万。30岁开始同样金额只有¥150万。早10年，多2.5倍。',
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/10" />,
      icon: <DollarSign className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: '智能资产配置',
      description: 'AI算法自动分析您的资产状况，优先分配到under-allocated类别，保持投资组合平衡。自动再平衡。',
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/10" />,
      icon: <Target className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: '可视化追踪',
      description: '实时追踪投资进度，预测目标达成时间，让每一分钱的增长都清晰可见。一目了然。',
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/10" />,
      icon: <BarChart3 className="h-4 w-4 text-neutral-500" />,
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
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(ROUTES.VISITOR)}
              className="w-full md:w-auto min-w-[200px]"
            >
              <Zap className="mr-2 w-5 h-5 text-gold-primary" />
              演示模式
            </Button>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">核心投资策略</h2>
            <p className="text-gray-400">科学的资产配置比例，让财富稳健增长</p>
          </div>
          
          <HoverEffect items={investmentCategories} />
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">为什么选择 Hi Money</h2>
          </div>
          
          <BentoGrid className="max-w-4xl mx-auto">
            {benefits.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={i === 1 ? "md:col-span-2" : ""}
              />
            ))}
          </BentoGrid>
        </div>
      </div>
    </PageContainer>
  );
}
