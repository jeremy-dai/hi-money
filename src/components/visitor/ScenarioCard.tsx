/**
 * Scenario Card Component
 * 
 * Displays a preview card for a demo scenario in visitor mode.
 * Shows key profile information and allows selection.
 */

import { Card } from '../common/Card';
import { Button } from '../common/Button';
import type { DemoScenario } from '../../types/visitor.types';
import { User, MapPin, DollarSign, Home, Users } from 'lucide-react';

interface ScenarioCardProps {
  scenario: DemoScenario;
  onSelect: (scenario: DemoScenario) => void;
  onViewDetails?: (scenario: DemoScenario) => void;
}

export function ScenarioCard({ scenario, onSelect, onViewDetails }: ScenarioCardProps) {
  const { name, description, profile } = scenario;

  return (
    <Card className="h-full flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gold-primary" />
            <span className="text-gray-400">{profile.age}岁</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gold-primary" />
            <span className="text-gray-400">
              {profile.cityTier === 1 ? '一线城市' : 
               profile.cityTier === 2 ? '二线城市' :
               profile.cityTier === 3 ? '三线城市' : '四线城市'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-gold-primary" />
            <span className="text-gray-400">¥{profile.monthlyIncome.toLocaleString()}/月</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {profile.hasChildren ? (
              <>
                <Users className="w-4 h-4 text-gold-primary" />
                <span className="text-gray-400">{profile.childrenCount}孩</span>
              </>
            ) : (
              <>
                <Home className="w-4 h-4 text-gold-primary" />
                <span className="text-gray-400">
                  {profile.maritalStatus === 'single' ? '单身' : 
                   profile.maritalStatus === 'married' ? '已婚' : '离异'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Risk Tolerance & Goal */}
        <div className="flex gap-2 mb-4">
          <span className="px-2 py-1 bg-black-soft rounded text-xs text-gray-400">
            {profile.riskTolerance === 'aggressive' ? '进取型' :
             profile.riskTolerance === 'moderate' ? '稳健型' : '保守型'}
          </span>
          <span className="px-2 py-1 bg-black-soft rounded text-xs text-gray-400">
            {profile.primaryGoal === 'wealth' ? '财富增长' :
             profile.primaryGoal === 'education' ? '教育规划' :
             profile.primaryGoal === 'retirement' ? '退休规划' :
             profile.primaryGoal === 'house' ? '购房目标' : '安全保障'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-black-border">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onSelect(scenario)}
          className="flex-1"
        >
          进入演示
        </Button>
        {onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(scenario)}
          >
            详情
          </Button>
        )}
      </div>
    </Card>
  );
}

