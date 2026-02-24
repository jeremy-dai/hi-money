import { useState, useEffect } from 'react';
import { Check, X, Plus, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import type { InsurancePolicy, InsuranceCategory, InsuranceSubCategory } from '../../types/insurance.types';
import { 
  INSURANCE_CATEGORY_LABELS, 
  INSURANCE_SUBCATEGORY_LABELS, 
  INSURANCE_CATEGORY_MAPPING 
} from '../../utils/insuranceConstants';
import { calculateCurrentCashValue } from '../../lib/utils';

interface Props {
  onSave: (policy: InsurancePolicy) => void;
  onCancel: () => void;
  initial?: Partial<InsurancePolicy>;
}

export function PolicyForm({ onSave, onCancel, initial }: Props) {
  const [form, setForm] = useState<Partial<InsurancePolicy>>({
    name: '',
    type: '',
    annualPremium: 0,
    cashValue: 0,
    coverageAmount: 0,
    startDate: '',
    notes: '',
    benefits: {},
    ...initial,
  });
  const [showBenefits, setShowBenefits] = useState(false);
  const [benefitKey, setBenefitKey] = useState('');
  const [benefitVal, setBenefitVal] = useState('');

  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleInput, setScheduleInput] = useState('');
  const [showBatchInput, setShowBatchInput] = useState(false);

  const update = (k: keyof InsurancePolicy, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Auto-calculate cash value whenever schedule or startDate changes
  useEffect(() => {
    if (form.cashValueSchedule && form.cashValueSchedule.length > 0 && form.startDate) {
      const newVal = calculateCurrentCashValue(form.startDate, form.cashValueSchedule);
      if (form.cashValue !== newVal) {
        update('cashValue', newVal);
      }
    }
  }, [form.cashValueSchedule, form.startDate]);

  const updateSchedule = (index: number, field: 'year' | 'amount', value: number) => {
    const newSchedule = [...(form.cashValueSchedule || [])];
    if (!newSchedule[index]) return;
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    // Sort by year
    newSchedule.sort((a, b) => a.year - b.year);
    update('cashValueSchedule', newSchedule);
  };

  const addScheduleRow = () => {
    const newSchedule = [...(form.cashValueSchedule || [])];
    const lastYear = newSchedule.length > 0 ? newSchedule[newSchedule.length - 1].year : 0;
    newSchedule.push({ year: lastYear + 1, amount: 0 });
    update('cashValueSchedule', newSchedule);
  };

  const removeScheduleRow = (index: number) => {
    const newSchedule = [...(form.cashValueSchedule || [])];
    newSchedule.splice(index, 1);
    update('cashValueSchedule', newSchedule);
  };
  
  const handleBatchSchedule = () => {
    if (!scheduleInput.trim()) return;
    
    // Parse lines like "1 500" or just "500" (auto-increment year)
    const lines = scheduleInput.split('\n').filter(l => l.trim());
    const newSchedule: { year: number; amount: number }[] = [];
    
    let currentYear = 1;
    lines.forEach(line => {
       const parts = line.trim().split(/\s+/);
       if (parts.length >= 2) {
          const y = parseInt(parts[0]);
          const v = parseFloat(parts[1]);
          if (!isNaN(y) && !isNaN(v)) {
             newSchedule.push({ year: y, amount: v });
             currentYear = y + 1;
          }
       } else if (parts.length === 1) {
          const v = parseFloat(parts[0]);
          if (!isNaN(v)) {
             newSchedule.push({ year: currentYear, amount: v });
             currentYear++;
          }
       }
    });
    
    if (newSchedule.length > 0) {
       newSchedule.sort((a, b) => a.year - b.year);
       update('cashValueSchedule', newSchedule);
       setShowBatchInput(false);
       setScheduleInput('');
    }
  };

  const getCompletedYears = () => {
    if (!form.startDate) return 0;
    const start = new Date(form.startDate);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const years = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, Math.floor(years));
  };


  const addBenefit = () => {
    if (!benefitKey.trim()) return;
    update('benefits', { ...(form.benefits ?? {}), [benefitKey.trim()]: benefitVal.trim() });
    setBenefitKey('');
    setBenefitVal('');
  };

  const removeBenefit = (k: string) => {
    const next = { ...(form.benefits ?? {}) };
    delete next[k];
    update('benefits', next);
  };

  const handleSave = () => {
    if (!form.name || !form.annualPremium) return;
    onSave({
      id: initial?.id ?? `pol_${Date.now()}`,
      name: form.name!,
      type: form.type || '未分类',
      category: form.category,
      subCategory: form.subCategory,
      isTaxAdvantaged: form.isTaxAdvantaged,
      annualPremium: form.annualPremium ?? 0,
      cashValue: form.cashValue ?? 0,
      cashValueSchedule: form.cashValueSchedule,
      coverageAmount: form.coverageAmount ?? 0,
      startDate: form.startDate || '',
      notes: form.notes,
      benefits: form.benefits ?? {},
    });
  };

  const inputCls =
    'w-full bg-black-soft border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-gray-600';

  return (
    <div className="space-y-4">
      {/* Basic info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs text-gray-400 block mb-1">保单名称 *</label>
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="例：平安福终身寿险"
          />
        </div>
        
        <div>
          <label className="text-xs text-gray-400 block mb-1">险种大类</label>
          <select
            className={inputCls}
            value={form.category || ''}
            onChange={(e) => {
              const cat = e.target.value as InsuranceCategory;
              update('category', cat);
              update('subCategory', undefined);
              // Auto-fill legacy type for compatibility
              update('type', INSURANCE_CATEGORY_LABELS[cat] || '');
            }}
          >
            <option value="">请选择...</option>
            {Object.entries(INSURANCE_CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">具体险种</label>
          <select
            className={inputCls}
            value={form.subCategory || ''}
            disabled={!form.category}
            onChange={(e) => {
              const sub = e.target.value as InsuranceSubCategory;
              update('subCategory', sub);
              update('type', INSURANCE_SUBCATEGORY_LABELS[sub] || sub);
            }}
          >
            <option value="">请选择...</option>
            {(form.category ? INSURANCE_CATEGORY_MAPPING[form.category] : []).map(sub => (
              <option key={sub} value={sub}>{INSURANCE_SUBCATEGORY_LABELS[sub]}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2 flex items-center gap-2 py-1">
           <input 
             type="checkbox" 
             id="taxAdvantaged"
             checked={!!form.isTaxAdvantaged}
             onChange={e => update('isTaxAdvantaged', e.target.checked)}
             className="rounded border-gray-600 bg-black-soft text-indigo-500 focus:ring-offset-0"
           />
           <label htmlFor="taxAdvantaged" className="text-sm text-gray-300 cursor-pointer select-none">
             税优产品 (Tax-Advantaged)
           </label>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">投保日期</label>
          <input
            type="month"
            className={inputCls}
            value={form.startDate}
            onChange={(e) => update('startDate', e.target.value)}
          />
        </div>
      </div>

      {/* Triple-dispatch inputs */}
      <div className="rounded-xl border border-white/8 bg-black-elevated/40 p-4 space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">三重分发数值</p>

        <div>
          <label className="text-xs text-gray-400 block mb-1">
            年交保费 (元)
            <span className="ml-2 text-indigo-400">→ 计入支出预算</span>
          </label>
          <input
            type="number"
            className={inputCls}
            value={form.annualPremium || ''}
            onChange={(e) => update('annualPremium', parseFloat(e.target.value) || 0)}
            placeholder="12000"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">
            当前现金价值 (元)
            <span className="ml-2 text-blue-400">→ 计入净资产（稳健类）</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                className={`${inputCls} ${form.cashValueSchedule?.length ? 'bg-white/5 text-gray-400 cursor-not-allowed' : ''}`}
                value={form.cashValue || ''}
                onChange={(e) => update('cashValue', parseFloat(e.target.value) || 0)}
                placeholder="35000（消费型险种填 0）"
                disabled={!!form.cashValueSchedule?.length}
              />
              {!!form.cashValueSchedule?.length && (
                 <span className="absolute right-2 top-2 text-xs text-blue-400 flex items-center gap-1">
                   <RefreshCw size={12} className="animate-spin-slow" /> 自动计算
                 </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-xs text-blue-300 rounded-lg transition-colors border border-white/10 whitespace-nowrap"
            >
              {showSchedule ? '隐藏表' : '现金价值表'}
            </button>
          </div>
          
          {showSchedule && (
            <div className="mt-3 p-3 bg-black-soft/50 border border-white/5 rounded-lg space-y-3">
               {/* Header / Mode Switch */}
               <div className="flex items-center justify-between text-xs text-gray-500 px-1 pb-2 border-b border-white/5">
                 <div className="flex gap-4">
                   <button 
                     onClick={() => setShowBatchInput(false)}
                     className={!showBatchInput ? "text-white font-medium" : "hover:text-gray-300"}
                   >
                     列表模式
                   </button>
                   <button 
                     onClick={() => setShowBatchInput(true)}
                     className={showBatchInput ? "text-white font-medium" : "hover:text-gray-300"}
                   >
                     批量粘贴
                   </button>
                 </div>
               </div>
               
               {!showBatchInput ? (
                 <>
                   <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                     <span className="w-20">保单年度</span>
                     <span className="flex-1 text-right pr-8">末期现金价值</span>
                     <span className="w-6"></span>
                   </div>
                   
                   <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                     {(form.cashValueSchedule || []).map((row, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <div className="relative w-20">
                            <span className="absolute left-2 top-1.5 text-xs text-gray-500">第</span>
                            <input 
                              type="number" 
                              className="w-full bg-black-elevated border border-white/10 rounded px-2 pl-6 py-1 text-white text-xs text-center"
                              value={row.year}
                              onChange={e => updateSchedule(idx, 'year', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div className="flex-1 relative">
                            <span className="absolute left-2 top-1.5 text-xs text-gray-500">¥</span>
                            <input 
                              type="number" 
                              className="w-full bg-black-elevated border border-white/10 rounded px-2 pl-6 py-1 text-white text-xs text-right font-mono"
                              value={row.amount}
                              onChange={e => updateSchedule(idx, 'amount', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeScheduleRow(idx)}
                            className="text-gray-600 hover:text-red-400 p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                     ))}
                   </div>
                   
                   <div className="flex items-center justify-between pt-2 border-t border-white/5">
                     <button 
                       type="button"
                       onClick={addScheduleRow} 
                       className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                     >
                       <Plus size={12}/> 添加年度
                     </button>
                     
                     {form.startDate && (
                        <span className="text-[10px] text-gray-500">
                          当前处于第 {getCompletedYears() + 1} 保单年度
                        </span>
                     )}
                   </div>
                 </>
               ) : (
                 <div className="space-y-2">
                   <textarea
                     value={scheduleInput}
                     onChange={e => setScheduleInput(e.target.value)}
                     placeholder={`粘贴格式示例：
1 500
2 1200
3 2500
(也可以只粘贴数值，年份自动递增)`}
                     className="w-full h-32 bg-black-elevated border border-white/10 rounded p-2 text-xs font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
                   />
                   <div className="flex justify-end gap-2">
                     <button
                       onClick={handleBatchSchedule}
                       className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded"
                     >
                       识别并填充
                     </button>
                   </div>
                 </div>
               )}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">
            核心保额 (元)
            <span className="ml-2 text-emerald-400">→ 计入抗风险杠杆率</span>
          </label>
          <input
            type="number"
            className={inputCls}
            value={form.coverageAmount || ''}
            onChange={(e) => update('coverageAmount', parseFloat(e.target.value) || 0)}
            placeholder="500000"
          />
        </div>
      </div>

      {/* Benefits */}
      <div>
        <button
          type="button"
          onClick={() => setShowBenefits((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {showBenefits ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          保障权益详情 ({Object.keys(form.benefits ?? {}).length})
        </button>
        {showBenefits && (
          <div className="mt-2 space-y-2">
            {Object.entries(form.benefits ?? {}).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 text-sm">
                <span className="text-gray-300 flex-1">
                  {k}: <span className="text-white">{v}</span>
                </span>
                <button
                  onClick={() => removeBenefit(k)}
                  className="text-gray-600 hover:text-red-400"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                className="flex-1 bg-black-soft border border-white/10 rounded px-2 py-1 text-white text-xs placeholder:text-gray-600"
                value={benefitKey}
                onChange={(e) => setBenefitKey(e.target.value)}
                placeholder="权益名（如 心理咨询）"
              />
              <input
                className="flex-1 bg-black-soft border border-white/10 rounded px-2 py-1 text-white text-xs placeholder:text-gray-600"
                value={benefitVal}
                onChange={(e) => setBenefitVal(e.target.value)}
                placeholder="额度（如 5000/年）"
              />
              <button
                onClick={addBenefit}
                className="text-indigo-400 hover:text-indigo-300 px-2"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">备注</label>
        <input
          className={inputCls}
          value={form.notes || ''}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="附加险、特殊条款等"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={!form.name}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Check size={15} /> 保存
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors"
        >
          <X size={15} /> 取消
        </button>
      </div>
    </div>
  );
}
