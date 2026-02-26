import { TrendingUp, ShieldCheck, Wallet } from 'lucide-react';
import { Card } from '../common/Card';
import { InfoTooltip } from '../common/InfoTooltip';
import { formatCNY } from '../../lib/format';
import { TOOLTIP } from '../../utils/tooltipContent';

interface Props {
  totalNetWorth: number;
  ma3Spending: number;
  riskLeverageRatio: number;
}

export function HeroMetrics({ totalNetWorth, ma3Spending, riskLeverageRatio }: Props) {
  const metrics = [
    {
      icon: <Wallet size={18} className="text-indigo-400" />,
      label: '核心净资产',
      tooltip: TOOLTIP.coreNetWorth,
      value: formatCNY(totalNetWorth),
      sub: '投资账户 + 保单现金价值',
      color: 'text-white',
    },
    {
      icon: <TrendingUp size={18} className="text-amber-400" />,
      label: 'MA-3 月均支出',
      tooltip: TOOLTIP.ma3Spending,
      value: ma3Spending > 0 ? formatCNY(ma3Spending) : '—',
      sub: '近3个月移动平均',
      color: 'text-amber-400',
    },
    {
      icon: <ShieldCheck size={18} className="text-emerald-400" />,
      label: '抗风险杠杆率',
      tooltip: TOOLTIP.riskLeverageRatio,
      value: riskLeverageRatio > 0 ? `${riskLeverageRatio.toFixed(1)}x` : '—',
      sub: riskLeverageRatio >= 10 ? '已达标 ≥ 10x' : '目标 ≥ 10x',
      color: riskLeverageRatio >= 10 ? 'text-emerald-400' : 'text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {metrics.map((m) => (
        <Card key={m.label} className="text-center">
          <div className="flex justify-center mb-2">{m.icon}</div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <p className="text-xs text-gray-400">{m.label}</p>
            <InfoTooltip content={m.tooltip} position="bottom" iconColor="text-gray-600 hover:text-gray-400" />
          </div>
          <p className={`text-xl font-bold font-mono ${m.color}`}>{m.value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{m.sub}</p>
        </Card>
      ))}
    </div>
  );
}
