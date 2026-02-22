import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lightbulb, Zap, CheckCircle, Home, Car } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CATEGORY_COLORS } from '../utils/constants';
import { educationContent } from '../data/educationContent';
import { CategoryIcon } from '../utils/icons';
import type { CategoryType } from '../types';

// Helper to get icon component by name
const getIconComponent = (iconName: string) => {
  const icons: Record<string, typeof Home> = {
    Home,
    Car,
  };
  return icons[iconName];
};

export default function DetailPage() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: CategoryType }>();

  if (!type || !educationContent[type]) {
    return (
      <PageContainer>
        <Card>
          <h1 className="text-3xl font-bold mb-4">未找到类别</h1>
          <Button onClick={() => navigate(-1)}>返回</Button>
        </Card>
      </PageContainer>
    );
  }

  const content = educationContent[type];
  const color = CATEGORY_COLORS[type];

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card
            className="relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-2"
              style={{ background: color }}
            />
            <div className="mb-4">
              <CategoryIcon type={type} className="icon-glow" size={64} strokeWidth={2} style={{ color }} />
            </div>
            <h1 className="text-4xl font-bold mb-2" style={{ color }}>
              {content.title}
            </h1>
            <p className="text-xl text-gray-400 mb-4">{content.subtitle}</p>
            <p className="text-white-soft leading-relaxed">{content.intro}</p>
          </Card>
        </motion.div>

        {/* Steps */}
        <div className="space-y-6 mb-8">
          {content.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <h2 className="text-2xl font-bold mb-4" style={{ color }}>
                  {step.title}
                </h2>

                {step.type === 'questions' && step.questions ? (
                  <>
                    <p className="text-white-soft mb-4 whitespace-pre-line">
                      {step.description}
                    </p>
                    <div className="space-y-3">
                      {step.questions.map((q, qIndex) => {
                        const IconComponent = getIconComponent(q.iconName);
                        return (
                          <div
                            key={qIndex}
                            className="flex items-start gap-3 p-4 bg-black-soft rounded-xl border border-gold-primary/10"
                          >
                            {IconComponent && (
                              <IconComponent className="text-gold-primary flex-shrink-0" size={28} strokeWidth={2} />
                            )}
                            <p className="text-white-soft flex-1">{q.text}</p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="prose max-w-none">
                    <p className="text-white-soft whitespace-pre-line leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                )}

                {step.type === 'risk-ladder' && (
                  <div className="mt-6 p-4 bg-black-soft/50 rounded-xl border border-gold-primary/20 flex items-start gap-3">
                    <Lightbulb className="text-gold-primary shrink-0" size={20} strokeWidth={2} />
                    <p className="text-sm text-gray-400">
                      <strong className="text-white">建议</strong>: 从低风险的指数基金开始，随着经验增长逐步多元化投资组合。
                    </p>
                  </div>
                )}

                {step.type === 'flow' && (
                  <div className="mt-6 p-4 bg-black-soft/50 rounded-xl border border-gold-primary/20 flex items-start gap-3">
                    <Zap className="text-gold-primary shrink-0" size={20} strokeWidth={2} />
                    <p className="text-sm text-gray-400">
                      <strong className="text-white">关键</strong>: 设置自动转账是成功的关键。不要依赖记忆或意志力。
                    </p>
                  </div>
                )}

                {step.type === 'list' && (
                  <div className="mt-6 p-4 bg-black-soft/50 rounded-xl border border-gold-primary/20 flex items-start gap-3">
                    <CheckCircle className="text-gold-primary shrink-0" size={20} strokeWidth={2} />
                    <p className="text-sm text-gray-400">
                      <strong className="text-white">自检</strong>: 每月审查开支，区分"需要"和"想要"。这会变得越来越容易。
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button onClick={() => navigate(-1)} variant="secondary" className="w-full">
            返回仪表盘
          </Button>
        </motion.div>
      </div>
    </PageContainer>
  );
}
