import { Pencil, Trash2, Wallet, PiggyBank, Shield } from 'lucide-react';
import { formatCNY } from '../../lib/format';
import { InfoTooltip } from '../common/InfoTooltip';
import type { InsurancePolicy, InsuranceSubCategory } from '../../types/insurance.types';
import { INSURANCE_SUBCATEGORY_LABELS } from '../../utils/insuranceConstants';
import { TOOLTIP } from '../../utils/tooltipContent';

// Map subcategory to tooltip content
const SUBCATEGORY_TOOLTIPS: Partial<Record<InsuranceSubCategory, React.ReactNode>> = {
  criticalIllness: TOOLTIP.criticalIllness,
  medical: TOOLTIP.medical,
  accident: TOOLTIP.accident,
  termLife: TOOLTIP.termLife,
  cancer: TOOLTIP.cancer,
  increasingWholeLife: TOOLTIP.increasingWholeLife,
  pensionAnnuity: TOOLTIP.pensionAnnuity,
  educationAnnuity: TOOLTIP.educationAnnuity,
  endowment: TOOLTIP.endowment,
  wholeLife: TOOLTIP.wholeLife,
  participating: TOOLTIP.participating,
  universalLife: TOOLTIP.universalLife,
  unitLinked: TOOLTIP.unitLinked,
};

interface Props {
  policy: InsurancePolicy;
  isReadOnly: boolean;
  onEdit: (policy: InsurancePolicy) => void;
  onDelete: (id: string) => void;
}

export function PolicyCard({ policy, isReadOnly, onEdit, onDelete }: Props) {
  const subcategoryTooltip = policy.subCategory
    ? SUBCATEGORY_TOOLTIPS[policy.subCategory]
    : undefined;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4 relative overflow-hidden group hover:border-white/20 transition-all">
      {policy.isTaxAdvantaged && (
        <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-bl-lg font-medium border-l border-b border-emerald-500/10 z-10">
          税优
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between pr-8">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
            {policy.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs font-medium text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              {policy.subCategory
                ? INSURANCE_SUBCATEGORY_LABELS[policy.subCategory]
                : '未分类'}
            </span>
            {subcategoryTooltip && (
              <InfoTooltip
                content={subcategoryTooltip}
                position="bottom"
                iconColor="text-indigo-400/60 hover:text-indigo-300"
                iconSize={13}
              />
            )}
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(policy)}
              className="text-gray-500 hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors"
              title="编辑保单"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(policy.id)}
              className="text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-white/10 transition-colors"
              title="删除保单"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        <MetricItem
          icon={<Wallet size={14} />}
          label="年保费"
          value={policy.annualPremium}
          color="text-indigo-400"
          subtext="支出"
          tooltip={TOOLTIP.annualPremium}
        />
        <MetricItem
          icon={<PiggyBank size={14} />}
          label="现金价值"
          value={policy.cashValue}
          color="text-blue-400"
          subtext="资产"
          tooltip={TOOLTIP.cashValue}
        />
        <MetricItem
          icon={<Shield size={14} />}
          label="保障额度"
          value={policy.coverageAmount}
          color="text-emerald-400"
          subtext="杠杆"
          tooltip={TOOLTIP.coverageAmount}
        />
      </div>
    </div>
  );
}

function MetricItem({
  icon,
  label,
  value,
  color,
  subtext,
  tooltip,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  subtext: string;
  tooltip: React.ReactNode;
}) {
  const isZero = value === 0;

  return (
    <div className={`rounded-lg p-2.5 text-center transition-colors ${isZero ? 'bg-white/2 opacity-60' : 'bg-black-soft'}`}>
      <div className={`flex items-center justify-center gap-1.5 text-xs ${isZero ? 'text-gray-500' : color} mb-1`}>
        {icon}
        <span>{subtext}</span>
      </div>
      <p className={`text-sm font-mono font-bold ${isZero ? 'text-gray-600' : 'text-white'}`}>
        {formatCNY(value)}
      </p>
      <div className="flex items-center justify-center gap-1 mt-0.5">
        <p className="text-[10px] text-gray-500">{label}</p>
        <InfoTooltip
          content={tooltip}
          position="top"
          iconColor="text-gray-600 hover:text-gray-400"
          iconSize={11}
        />
      </div>
    </div>
  );
}
