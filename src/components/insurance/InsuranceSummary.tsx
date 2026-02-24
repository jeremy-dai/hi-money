import { Wallet, PiggyBank, Shield, Info } from 'lucide-react';
import { Card } from '../common/Card';
import { formatCNY } from '../../lib/format';

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
        <div className="group relative">
          <Info size={14} className="text-indigo-400 cursor-help" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
            <p className="font-bold text-white mb-1">三重调度机制：</p>
            <ul className="list-disc pl-3 space-y-1">
              <li><span className="text-indigo-400">支出预算</span>：保费计入年度支出</li>
              <li><span className="text-blue-400">净资产</span>：现金价值计入家庭资产</li>
              <li><span className="text-emerald-400">抗风险杠杆</span>：保额用于抵御风险</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SummaryItem 
          label="年度保费支出" 
          value={totalAnnualPremiums} 
          icon={<Wallet className="text-indigo-400" size={18} />}
          color="text-indigo-400"
          desc="计入支出预算"
          subValue={monthlyPremiumCost > 0 ? `月均 ${formatCNY(monthlyPremiumCost)}` : undefined}
        />
        <SummaryItem 
          label="保单现金价值" 
          value={totalCashValue} 
          icon={<PiggyBank className="text-blue-400" size={18} />}
          color="text-blue-400"
          desc="计入稳健资产"
        />
        <SummaryItem 
          label="风险保障总额" 
          value={totalCoverageAmount} 
          icon={<Shield className="text-emerald-400" size={18} />}
          color="text-emerald-400"
          desc="家庭抗风险杠杆"
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
  subValue
}: { 
  label: string; 
  value: number; 
  icon: React.ReactNode; 
  color: string;
  desc: string;
  subValue?: string;
}) {
  return (
    <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center text-center hover:bg-black/30 transition-colors">
      <div className="mb-2 p-2 rounded-full bg-white/5">
        {icon}
      </div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
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
