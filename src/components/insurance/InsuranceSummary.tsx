import { Wallet, PiggyBank, Shield } from 'lucide-react';
import { Card } from '../common/Card';
import { InfoTooltip } from '../common/InfoTooltip';
import { formatCNY } from '../../lib/format';
import { TOOLTIP } from '../../utils/tooltipContent';

interface Props {
  totalAnnualPremiums: number;
  totalCashValue: number;
  totalCoverageAmount: number;
  monthlyPremiumCost: number;
}

export function InsuranceSummary({
  totalAnnualPremiums,
  totalCashValue,
  totalCoverageAmount,
  monthlyPremiumCost
}: Props) {
  return (
    <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">保险账户概览</h3>
        <InfoTooltip content={TOOLTIP.tripleDispatch} iconColor="text-indigo-400 hover:text-indigo-300" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SummaryItem
          label="年度保费支出"
          value={totalAnnualPremiums}
          icon={<Wallet className="text-indigo-400" size={18} />}
          color="text-indigo-400"
          desc="计入支出预算"
          tooltip={TOOLTIP.annualPremium}
          subValue={monthlyPremiumCost > 0 ? `月均 ${formatCNY(monthlyPremiumCost)}` : undefined}
        />
        <SummaryItem
          label="保单现金价值"
          value={totalCashValue}
          icon={<PiggyBank className="text-blue-400" size={18} />}
          color="text-blue-400"
          desc="计入稳健资产"
          tooltip={TOOLTIP.cashValue}
        />
        <SummaryItem
          label="风险保障总额"
          value={totalCoverageAmount}
          icon={<Shield className="text-emerald-400" size={18} />}
          color="text-emerald-400"
          desc="家庭抗风险杠杆"
          tooltip={TOOLTIP.coverageAmount}
        />
      </div>
    </Card>
  );
}

function SummaryItem({
  label,
  value,
  icon,
  color,
  desc,
  tooltip,
  subValue
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  desc: string;
  tooltip: React.ReactNode;
  subValue?: string;
}) {
  return (
    <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center text-center hover:bg-black/30 transition-colors">
      <div className="mb-2 p-2 rounded-full bg-white/5">
        {icon}
      </div>
      <div className="flex items-center gap-1 mb-0.5">
        <p className="text-xs text-gray-400">{label}</p>
        <InfoTooltip content={tooltip} position="top" iconColor="text-gray-600 hover:text-gray-400" iconSize={12} />
      </div>
      <p className={`text-lg font-bold font-mono text-white mb-1`}>
        {formatCNY(value)}
      </p>
      <p className={`text-[10px] ${color} bg-white/5 px-2 py-0.5 rounded-full`}>
        {desc}
      </p>
      {subValue && (
        <p className="text-[10px] text-gray-500 mt-2 pt-2 border-t border-white/5 w-full">
          {subValue}
        </p>
      )}
    </div>
  );
}
