/**
 * Visitor Mode Page
 * 
 * Landing page for visitor/demo mode. Displays a grid of 3 pre-configured
 * scenarios that insurance advisors can use to demonstrate the platform.
 */

import { PageContainer } from '../components/layout/PageContainer';
import { ScenarioCard } from '../components/visitor/ScenarioCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { DEMO_SCENARIOS } from '../data/demoScenarios';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { Presentation, ArrowRight, Info } from 'lucide-react';
import { useState } from 'react';

export default function VisitorModePage() {
  const navigate = useNavigate();
  const { activateVisitorMode } = useAppStore();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const handleSelectScenario = (scenario: typeof DEMO_SCENARIOS[0]) => {
    activateVisitorMode(scenario);
    navigate(ROUTES.DASHBOARD);
  };

  const handleEnterPresentation = (scenario: typeof DEMO_SCENARIOS[0]) => {
    activateVisitorMode(scenario);
    navigate(`/visitor/presentation`);
  };

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            访客演示模式
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            选择以下预设场景，向客户演示 Hi Money 平台的财富管理功能。
            所有演示数据不会保存到本地存储。
          </p>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 bg-gold-primary/10 border-gold-primary/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gold-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">演示模式说明</h3>
              <p className="text-gray-400 text-sm">
                访客模式使用临时数据，不会影响您的实际账户。演示结束后，所有数据将被清除。
                您可以选择进入仪表盘查看完整功能，或使用演示模式进行全屏展示。
              </p>
            </div>
          </div>
        </Card>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {DEMO_SCENARIOS.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onSelect={handleSelectScenario}
              onViewDetails={(s) => setSelectedScenario(s.id)}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate(ROUTES.WELCOME)}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            返回首页
          </Button>
        </div>

        {/* Selected Scenario Details Modal (if needed) */}
        {selectedScenario && (
          <div
            className="fixed inset-0 bg-black-primary/80 flex items-center justify-center z-50"
            onClick={() => setSelectedScenario(null)}
          >
            <div onClick={(e) => e.stopPropagation()}>
            <Card
              className="max-w-2xl w-full mx-4"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {DEMO_SCENARIOS.find((s) => s.id === selectedScenario)?.name}
                </h2>
                <button
                  onClick={() => setSelectedScenario(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-400">
                  {DEMO_SCENARIOS.find((s) => s.id === selectedScenario)?.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      const scenario = DEMO_SCENARIOS.find((s) => s.id === selectedScenario);
                      if (scenario) {
                        handleSelectScenario(scenario);
                      }
                    }}
                  >
                    进入仪表盘
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const scenario = DEMO_SCENARIOS.find((s) => s.id === selectedScenario);
                      if (scenario) {
                        handleEnterPresentation(scenario);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Presentation className="w-4 h-4" />
                    演示模式
                  </Button>
                </div>
              </div>
            </Card>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

