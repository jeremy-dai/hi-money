import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Shield,
  ShieldAlert,
  TrendingUp,
  Landmark,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Calculator,
  BookOpen,
  FileText,
  List,
  Bot,
  FileJson,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { WealthCard } from '../components/assets/WealthCard';
import { PolicyForm } from '../components/insurance/PolicyForm';
import { PolicyCard } from '../components/insurance/PolicyCard';
import { InsuranceSummary } from '../components/insurance/InsuranceSummary';
import { InsuranceGapChart } from '../components/insurance/InsuranceGapChart';
import { BatchPolicyImport } from '../components/insurance/BatchPolicyImport';
import { JsonPolicyImport } from '../components/insurance/JsonPolicyImport';
import { FreshnessIndicator } from '../components/common/FreshnessIndicator';
import { formatCNY } from '../lib/format';
import {
  getTotalCashValue,
  getTotalAnnualPremiums,
  getTotalCoverage,
  getMonthlyPremiumCost,
  getCashValueByAssetCategory,
  getPoliciesByAssetCategory,
} from '../algorithms/insuranceDispatch';
import { calculateInsuranceGap } from '../algorithms/insuranceCalculator';
import type { InvestmentCategoryType } from '../types';
import type { InsurancePolicy, InsuranceCategory } from '../types/insurance.types';
import type { InsuranceProfile } from '../types/profile.types';
import {
  INVESTMENT_CATEGORY_NAMES,
  INVESTMENT_CATEGORY_DESCRIPTIONS,
  INVESTMENT_CATEGORY_COLORS,
} from '../utils/constants';
import { AllocationCalculator } from '../components/assets/AllocationCalculator';
import {
  INSURANCE_CATEGORY_LABELS,
  INSURANCE_CATEGORY_COLORS
} from '../utils/insuranceConstants';

type TabType = 'investments' | 'insurance';

const CATEGORY_TEXT: Record<InvestmentCategoryType, string> = {
  growth: 'text-emerald-400',
  stability: 'text-blue-400',
  special: 'text-violet-400',
  emergency: 'text-amber-400',
};

const CATEGORY_ICON: Record<InvestmentCategoryType, React.ReactNode> = {
  growth: <TrendingUp size={16} />,
  stability: <Landmark size={16} />,
  special: <Shield size={16} />,
  emergency: <ShieldAlert size={16} />,
};

export default function AssetsPage() {
  const store = useAppStore();
  const data = store.getCurrentData();
  const { accounts, policies, userProfile } = data;
  const isReadOnly = store.activeMode === 'EXAMPLE';

  const [activeTab, setActiveTab] = useState<TabType>('investments');
  const [showGapAnalysis, setShowGapAnalysis] = useState(false);
  const [expanded, setExpanded] = useState<Record<InvestmentCategoryType, boolean>>({
    growth: true,
    stability: true,
    special: true,
    emergency: true,
  });
  const [editingAccount, setEditingAccount] = useState<{
    category: InvestmentCategoryType;
    index: number;
    value: string;
  } | null>(null);
  const [addingTo, setAddingTo] = useState<{
    category: InvestmentCategoryType;
    name: string;
    amount: string;
  } | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [insuranceInputMode, setInsuranceInputMode] = useState<'manual' | 'batch' | 'json'>('manual');
  const [batchAccountText, setBatchAccountText] = useState('');
  const [parsedBatchAccounts, setParsedBatchAccounts] = useState<
    Array<{ category: InvestmentCategoryType; name: string; amount: number }>
  >([]);
  const [singleAccountForm, setSingleAccountForm] = useState<{
    category: InvestmentCategoryType;
    name: string;
    amount: string;
  }>({ category: 'growth', name: '', amount: '' });

  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);
  const [showAllocationCalc, setShowAllocationCalc] = useState(false);
  const [editingTargets, setEditingTargets] = useState(false);
  const [targetDraft, setTargetDraft] = useState({ growth: 0, stability: 0, special: 0 });
  const [showRationale, setShowRationale] = useState(false);
  const [showInsuranceGuide, setShowInsuranceGuide] = useState(false);

  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (guideRef.current && !guideRef.current.contains(e.target as Node)) {
        setShowInsuranceGuide(false);
      }
    };
    if (showInsuranceGuide) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInsuranceGuide]);

  const recommendedAllocation = store.getRecommendedAllocation();
  const userTargets = store.getInvestmentTargets();
  const insuranceCashByCategory = getCashValueByAssetCategory(policies);
  const insurancePoliciesByCategory = getPoliciesByAssetCategory(policies);

  const totalNetWorth = store.getTotalAssets(); // Now includes insurance cash values in categories
  const totalCashValue = getTotalCashValue(policies);
  const totalInvestments = totalNetWorth - totalCashValue; // Account-only total for breakdown display
  const totalCoverageAmount = getTotalCoverage(policies);
  const totalAnnualPremiums = getTotalAnnualPremiums(policies);
  const monthlyPremiumCost = getMonthlyPremiumCost(policies);
  const riskLeverageRatio = store.getRiskLeverageRatio();

  // Insurance Gap Analysis
  const insuranceProfile: InsuranceProfile = useMemo(() => {
    const profile: InsuranceProfile = {
      existingCoverage: {
        medicalInsurance: 0,
        lifeInsurance: 0,
        criticalIllness: 0,
        accidentInsurance: 0,
      },
      existingCoverageAmount: {
        life: 0,
        criticalIllness: 0,
        medical: 0,
      },
      dependents: (userProfile?.childrenCount || 0) + (userProfile?.maritalStatus === 'married' ? 1 : 0),
      parentsCare: userProfile?.parentsCare || false,
    };

    policies.forEach((p) => {
      const amount = p.coverageAmount || 0;
      const type = p.subCategory || '';
      
      if (type === 'medical') {
        profile.existingCoverage.medicalInsurance += amount;
        profile.existingCoverageAmount.medical += amount;
      } else if (['termLife', 'wholeLife', 'increasingWholeLife', 'endowment'].includes(type)) {
        profile.existingCoverage.lifeInsurance += amount;
        profile.existingCoverageAmount.life += amount;
      } else if (type === 'criticalIllness') {
        profile.existingCoverage.criticalIllness += amount;
        profile.existingCoverageAmount.criticalIllness += amount;
      } else if (type === 'accident') {
        profile.existingCoverage.accidentInsurance += amount;
      }
    });

    return profile;
  }, [policies, userProfile]);

  const gapResult = useMemo(() => {
    if (!userProfile) return null;
    return calculateInsuranceGap({
      userProfile,
      insuranceProfile,
      mortgageBalance: userProfile.hasMortgage ? userProfile.existingDebts : 0,
    });
  }, [userProfile, insuranceProfile]);

  const groupedPolicies = policies.reduce((acc, policy) => {
    const cat = policy.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(policy);
    return acc;
  }, {} as Record<string, typeof policies>);

  const insuranceCategories: InsuranceCategory[] = ['protection', 'savings', 'investment'];

  // targetCategories: used for allocation % target UI (emergency has no fixed % target)
  const targetCategories: Array<'growth' | 'stability' | 'special'> = ['growth', 'stability', 'special'];
  // allCategories: used for account cards (includes emergency)
  const allCategories: InvestmentCategoryType[] = ['growth', 'stability', 'special', 'emergency'];

  const tabs: { key: TabType; label: string }[] = [
    { key: 'investments', label: '投资账户' },
    { key: 'insurance', label: '保险保单' },
  ];

  const handleSaveEdit = () => {
    if (!editingAccount) return;
    const amount = parseFloat(editingAccount.value);
    if (!isNaN(amount) && amount >= 0) {
      store.updateAccountAmount(editingAccount.category, editingAccount.index, amount);
    }
    setEditingAccount(null);
  };

  const handleSaveAdd = () => {
    if (!addingTo) return;
    const amount = parseFloat(addingTo.amount);
    if (addingTo.name.trim() && !isNaN(amount) && amount >= 0) {
      store.addAccount(addingTo.category, { name: addingTo.name.trim(), amount });
    }
    setAddingTo(null);
  };

  const CATEGORY_KEYWORDS: Record<string, InvestmentCategoryType> = {
    '成长': 'growth', '成长投资': 'growth', 'growth': 'growth',
    '稳健': 'stability', '稳健储蓄': 'stability', 'stability': 'stability',
    '特殊': 'special', '特殊用途': 'special', 'special': 'special',
    '应急': 'emergency', '应急基金': 'emergency', 'emergency': 'emergency',
  };

  const handleAccountBatchParse = (text: string) => {
    setBatchAccountText(text);
    const lines = text.split('\n').filter(l => l.trim());
    const results: Array<{ category: InvestmentCategoryType; name: string; amount: number }> = [];

    lines.forEach(line => {
      const parts = line.split(/[\t,]+|\s{2,}/).map(p => p.trim()).filter(p => p);
      if (parts.length >= 3) {
        const category = CATEGORY_KEYWORDS[parts[0]];
        if (!category) return;
        const amountStr = parts[parts.length - 1].replace(/[,¥]/g, '');
        const amount = parseFloat(amountStr);
        const name = parts.slice(1, parts.length - 1).join(' ');
        if (name && !isNaN(amount) && amount >= 0) {
          results.push({ category, name, amount });
        }
      }
    });

    setParsedBatchAccounts(results);
  };

  const handleAccountBatchSave = () => {
    if (parsedBatchAccounts.length === 0) return;
    parsedBatchAccounts.forEach(({ category, name, amount }) => {
      store.addAccount(category, { name, amount });
    });
    setShowAdd(false);
    setBatchAccountText('');
    setParsedBatchAccounts([]);
  };

  const handleSingleAccountSave = () => {
    const amount = parseFloat(singleAccountForm.amount);
    if (singleAccountForm.name.trim() && !isNaN(amount) && amount >= 0) {
      store.addAccount(singleAccountForm.category, { name: singleAccountForm.name.trim(), amount });
      setSingleAccountForm({ category: 'growth', name: '', amount: '' });
      setShowAdd(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto pb-20 pt-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">资产管理</h1>
            <p className="text-gray-400 text-sm mt-1">管理投资账户与保险保单</p>
          </div>
          <div className="flex items-center gap-2">
            {/* 保险配置指南 popover — only on insurance tab */}
            {activeTab === 'insurance' && (
              <div className="relative" ref={guideRef}>
                <button
                  onClick={() => setShowInsuranceGuide(!showInsuranceGuide)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-gray-200 text-sm transition-all"
                >
                  <BookOpen size={14} />
                  保险配置指南
                </button>
                <AnimatePresence>
                  {showInsuranceGuide && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-96 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4 space-y-3 max-h-[70vh] overflow-y-auto"
                    >
                      <p className="text-xs font-semibold text-white">保险配置指南</p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        保险分为三大类，根据不同目的配置。保障型优先，储蓄型其次，投资型量力而行。建议保费支出控制在年收入的 7.5% 左右。
                      </p>

                      {/* Three Categories */}
                      <div className="space-y-2">
                        {([
                          {
                            category: 'protection' as const,
                            label: '保障型',
                            desc: '抵御风险，优先配置',
                            color: 'text-emerald-400',
                            bg: 'bg-emerald-500/10',
                            items: [
                              { name: '重疾险', tip: '覆盖 3-5 年收入' },
                              { name: '医疗险', tip: '百万医疗 300 万保额' },
                              { name: '意外险', tip: '杠杆最高，7 倍年收入' },
                              { name: '定期寿险', tip: '覆盖负债+10 年收入' },
                              { name: '防癌险', tip: '适合老年人群' },
                            ],
                          },
                          {
                            category: 'savings' as const,
                            label: '储蓄型',
                            desc: '强制储蓄，锁定收益',
                            color: 'text-blue-400',
                            bg: 'bg-blue-500/10',
                            items: [
                              { name: '增额终身寿', tip: '现金价值逐年递增' },
                              { name: '养老年金', tip: '对冲长寿风险' },
                              { name: '教育金', tip: '专款专用' },
                              { name: '两全险', tip: '兼顾保障与储蓄' },
                              { name: '终身寿险', tip: '财富传承工具' },
                            ],
                          },
                          {
                            category: 'investment' as const,
                            label: '投资型',
                            desc: '追求增值，风险较高',
                            color: 'text-violet-400',
                            bg: 'bg-violet-500/10',
                            items: [
                              { name: '分红险', tip: '分红不保证' },
                              { name: '万能险', tip: '有保底利率' },
                              { name: '投连险', tip: '无保底，风险最高' },
                            ],
                          },
                        ]).map((group) => (
                          <div key={group.category} className={`p-2.5 rounded-lg ${group.bg}`}>
                            <p className={`text-xs font-semibold ${group.color}`}>
                              {group.label}
                              <span className="text-xs font-normal text-gray-400 ml-2">{group.desc}</span>
                            </p>
                            <div className="space-y-1 mt-1.5">
                              {group.items.map((item) => (
                                <div key={item.name} className="flex items-start gap-2">
                                  <span className="text-xs text-white font-medium shrink-0">{item.name}</span>
                                  <span className="text-xs text-gray-500">{item.tip}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Triple Dispatch */}
                      <div className="p-2.5 rounded-lg bg-white/3">
                        <p className="text-xs font-semibold text-white mb-1.5">保单三重属性</p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: '年保费', desc: '→ 支出', color: 'text-amber-400' },
                            { label: '现金价值', desc: '→ 净资产', color: 'text-blue-400' },
                            { label: '保额', desc: '→ 风险杠杆', color: 'text-emerald-400' },
                          ].map((d) => (
                            <div key={d.label} className="text-center">
                              <p className={`text-xs font-semibold ${d.color}`}>{d.label}</p>
                              <p className="text-xs text-gray-500">{d.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: '风险杠杆 ≥ 10x', desc: '总保额 / 年支出', color: 'text-emerald-400' },
                          { label: '保费预算 7.5%', desc: '年收入占比', color: 'text-blue-400' },
                          { label: '家庭配比 6:3:1', desc: '主力:配偶:子女', color: 'text-amber-400' },
                          { label: '医→意→重→寿', desc: '优先顺序', color: 'text-pink-400' },
                        ].map((m) => (
                          <div key={m.label} className="p-2 rounded-lg bg-white/3">
                            <p className={`text-xs font-semibold ${m.color}`}>{m.label}</p>
                            <p className="text-xs text-gray-500">{m.desc}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Primary action button */}
            {!isReadOnly && (
              <button
                onClick={() => setShowAdd((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                {activeTab === 'investments' ? '录入账户' : '录入保险'}
              </button>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setShowAdd(false);
                setIsBatchMode(false);
                setEditingPolicy(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Unified inline form card */}
        <AnimatePresence>
          {showAdd && !isReadOnly && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="border-indigo-600/40">
                {activeTab === 'investments' ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-semibold text-white">
                        {isBatchMode ? '批量录入账户' : '录入投资账户'}
                      </h3>
                      <button
                        onClick={() => setIsBatchMode(!isBatchMode)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        {isBatchMode ? (
                          <><List size={14} /> 切换单条录入</>
                        ) : (
                          <><FileText size={14} /> 切换批量录入</>
                        )}
                      </button>
                    </div>

                    {isBatchMode ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <p className="text-xs text-blue-200">
                            支持从 Excel 或文本粘贴。每行一条账户，格式：<br />
                            <code className="bg-black/30 px-1 py-0.5 rounded text-blue-100">类别{'  '}账户名称{'  '}金额</code><br />
                            类别支持：成长、稳健、特殊、应急。分隔符支持制表符(Tab)、逗号或两个以上空格。
                          </p>
                        </div>

                        <textarea
                          value={batchAccountText}
                          onChange={(e) => handleAccountBatchParse(e.target.value)}
                          placeholder={"成长  招商银行股票  50000\n稳健  国债账户  30000\n应急  余额宝  20000"}
                          className="w-full h-32 bg-black-soft border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                        />

                        {parsedBatchAccounts.length > 0 && (
                          <div className="bg-black-soft rounded-lg overflow-hidden border border-white/10">
                            <div className="px-3 py-2 bg-white/5 border-b border-white/10 flex text-xs text-gray-400 font-medium">
                              <div className="w-20">类别</div>
                              <div className="flex-1">账户名称</div>
                              <div className="w-28 text-right">金额</div>
                            </div>
                            <div className="max-h-40 overflow-y-auto">
                              {parsedBatchAccounts.map((row, i) => (
                                <div key={i} className="px-3 py-2 flex text-sm text-gray-300 border-b border-white/5 last:border-0">
                                  <div className={`w-20 text-xs ${CATEGORY_TEXT[row.category]}`}>
                                    {INVESTMENT_CATEGORY_NAMES[row.category]}
                                  </div>
                                  <div className="flex-1 truncate">{row.name}</div>
                                  <div className="w-28 font-mono text-right">{formatCNY(row.amount)}</div>
                                </div>
                              ))}
                            </div>
                            <div className="px-3 py-2 bg-white/5 border-t border-white/10 text-xs text-gray-400 text-right">
                              共解析 {parsedBatchAccounts.length} 条账户
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={handleAccountBatchSave}
                            disabled={parsedBatchAccounts.length === 0}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <Check size={15} /> 批量保存
                          </button>
                          <button
                            onClick={() => setShowAdd(false)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors"
                          >
                            <X size={15} /> 取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-end gap-3">
                          <div className="w-28">
                            <label className="text-xs text-gray-400 block mb-1">类别</label>
                            <select
                              value={singleAccountForm.category}
                              onChange={(e) => setSingleAccountForm(f => ({ ...f, category: e.target.value as InvestmentCategoryType }))}
                              className="w-full bg-black-soft border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 appearance-none"
                            >
                              {allCategories.map(cat => (
                                <option key={cat} value={cat}>{INVESTMENT_CATEGORY_NAMES[cat]}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-gray-400 block mb-1">账户名称</label>
                            <input
                              type="text"
                              value={singleAccountForm.name}
                              onChange={(e) => setSingleAccountForm(f => ({ ...f, name: e.target.value }))}
                              placeholder="例：招商银行股票"
                              className="w-full bg-black-soft border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div className="w-36">
                            <label className="text-xs text-gray-400 block mb-1">金额 (元)</label>
                            <input
                              type="number"
                              value={singleAccountForm.amount}
                              onChange={(e) => setSingleAccountForm(f => ({ ...f, amount: e.target.value }))}
                              placeholder="50000"
                              className="w-full bg-black-soft border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <button
                            onClick={handleSingleAccountSave}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <Check size={15} /> 保存
                          </button>
                          <button
                            onClick={() => setShowAdd(false)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors"
                          >
                            <X size={15} /> 取消
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-semibold text-white">
                        {insuranceInputMode === 'batch' ? 'AI 批量导入保单' : insuranceInputMode === 'json' ? 'JSON 导入保单' : '录入保险保单'}
                      </h3>
                      <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
                        {([
                          { key: 'manual' as const, icon: List, label: '手动' },
                          { key: 'batch' as const, icon: Bot, label: 'AI导入' },
                          { key: 'json' as const, icon: FileJson, label: 'JSON' },
                        ]).map(({ key, icon: Icon, label }) => (
                          <button
                            key={key}
                            onClick={() => setInsuranceInputMode(key)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                              insuranceInputMode === key
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                            }`}
                          >
                            <Icon size={12} /> {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {insuranceInputMode === 'batch' ? (
                      <BatchPolicyImport
                        embedded
                        isReadOnly={store.activeMode !== 'PERSONAL'}
                        onSave={(policies) => {
                          policies.forEach(p => store.addPolicy(p));
                          setShowAdd(false);
                        }}
                      />
                    ) : insuranceInputMode === 'json' ? (
                      <JsonPolicyImport
                        onSave={(policies) => {
                          policies.forEach(p => store.addPolicy(p));
                          setShowAdd(false);
                        }}
                      />
                    ) : (
                      <PolicyForm
                        initial={editingPolicy ?? undefined}
                        onSave={(policy) => {
                          if (editingPolicy) {
                            store.updatePolicy(editingPolicy.id, policy);
                          } else {
                            store.addPolicy(policy);
                          }
                          setShowAdd(false);
                          setEditingPolicy(null);
                        }}
                        onCancel={() => {
                          setShowAdd(false);
                          setEditingPolicy(null);
                        }}
                      />
                    )}
                  </>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ─── Investment Accounts ─── */}
          {activeTab === 'investments' && (
            <motion.div
              key="investments"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Target Asset Allocation Card */}
              {recommendedAllocation && (
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-white">目标资产比例</h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {userTargets ? '自定义目标' : '基于个人画像的智能推荐'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isReadOnly && !editingTargets && (
                        <button
                          onClick={() => {
                            const current = userTargets ?? recommendedAllocation.investmentAllocation;
                            setTargetDraft({ ...current });
                            setEditingTargets(true);
                          }}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => setShowAllocationCalc(!showAllocationCalc)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          showAllocationCalc
                            ? 'bg-indigo-600 text-white'
                            : 'bg-indigo-600/80 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        <Calculator size={14} /> 分配
                      </button>
                    </div>
                  </div>

                  {editingTargets ? (
                    <div className="space-y-3">
                      {targetCategories.map((cat) => {
                        const recPct = recommendedAllocation.investmentAllocation[cat];
                        return (
                          <div key={cat} className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 w-24">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: INVESTMENT_CATEGORY_COLORS[cat] }}
                              />
                              <span className={`text-xs ${CATEGORY_TEXT[cat]}`}>{INVESTMENT_CATEGORY_NAMES[cat]}</span>
                            </div>
                            <input
                              type="number"
                              value={targetDraft[cat]}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setTargetDraft((d) => ({ ...d, [cat]: val }));
                              }}
                              className="w-20 bg-black-elevated border border-white/10 rounded px-2 py-1 text-white text-sm text-right font-mono"
                              min={0}
                              max={100}
                              step={1}
                            />
                            <span className="text-xs text-gray-500">%</span>
                            <span className="text-xs text-gray-600 ml-auto">建议 {recPct.toFixed(0)}%</span>
                          </div>
                        );
                      })}
                      {(() => {
                        const sum = targetDraft.growth + targetDraft.stability + targetDraft.special;
                        const valid = Math.abs(sum - 100) < 0.1;
                        return (
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className={`text-xs font-mono ${valid ? 'text-gray-500' : 'text-red-400'}`}>
                              合计 {sum.toFixed(1)}%{!valid && ' (需等于100%)'}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setTargetDraft({ ...recommendedAllocation.investmentAllocation });
                                  store.setInvestmentTargets(null);
                                  setEditingTargets(false);
                                }}
                                className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                              >
                                重置为建议值
                              </button>
                              <button
                                onClick={() => setEditingTargets(false)}
                                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                              >
                                取消
                              </button>
                              <button
                                onClick={() => {
                                  if (Math.abs(targetDraft.growth + targetDraft.stability + targetDraft.special - 100) < 0.1) {
                                    store.setInvestmentTargets({ ...targetDraft });
                                    setEditingTargets(false);
                                  }
                                }}
                                disabled={!valid}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  valid
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                }`}
                              >
                                保存
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {targetCategories.map((cat) => {
                        const activeTargets = userTargets ?? recommendedAllocation.investmentAllocation;
                        const targetPct = activeTargets[cat];
                        const actualPct = store.getCategoryPercentage(cat);
                        const deviation = parseFloat((actualPct - targetPct).toFixed(1));
                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: INVESTMENT_CATEGORY_COLORS[cat] }}
                                />
                                <span className={CATEGORY_TEXT[cat]}>{INVESTMENT_CATEGORY_NAMES[cat]}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">目标 {targetPct.toFixed(1)}%</span>
                                <span className="font-mono text-gray-200">实际 {actualPct.toFixed(1)}%</span>
                                {Math.abs(deviation) > 2 && (
                                  <span className={`font-mono ${deviation > 0 ? 'text-amber-400' : 'text-blue-400'}`}>
                                    {deviation > 0 ? '+' : ''}{deviation}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="absolute inset-y-0 left-0 rounded-full opacity-80"
                                style={{
                                  width: `${Math.min(actualPct, 100)}%`,
                                  backgroundColor: INVESTMENT_CATEGORY_COLORS[cat],
                                }}
                              />
                              <div
                                className="absolute inset-y-0 w-0.5 bg-white/40"
                                style={{ left: `${Math.min(targetPct, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Algorithm rationale */}
                  {!editingTargets && recommendedAllocation.rationale && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <button
                        onClick={() => setShowRationale(!showRationale)}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
                      >
                        {showRationale ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        算法依据
                      </button>
                      <AnimatePresence>
                        {showRationale && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-gray-600 mt-2 leading-relaxed overflow-hidden"
                          >
                            {recommendedAllocation.rationale.summary}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <AnimatePresence>
                    {showAllocationCalc && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <AllocationCalculator
                          recommendedAllocation={userTargets ?? recommendedAllocation.investmentAllocation}
                          currentTotals={{
                            growth: store.getCategoryTotal('growth'),
                            stability: store.getCategoryTotal('stability'),
                            special: store.getCategoryTotal('special'),
                            emergency: store.getCategoryTotal('emergency'),
                          }}
                          totalCurrentAssets={totalNetWorth}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              )}

              {allCategories.map((cat) => {
                const catAccounts = accounts[cat] ?? [];
                const isOpen = expanded[cat];
                const catTotal = catAccounts.reduce((sum, a) => sum + a.amount, 0);
                const catInsurance = insuranceCashByCategory[cat];
                return (
                  <WealthCard key={cat} className="overflow-hidden p-0" enable3D={!isOpen}>
                    <div className="w-full flex items-center justify-between px-4 py-3">
                      <button
                        onClick={() => setExpanded((p) => ({ ...p, [cat]: !p[cat] }))}
                        className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
                      >
                        <span className={CATEGORY_TEXT[cat]}>{CATEGORY_ICON[cat]}</span>
                        <div className="text-left">
                          <p className={`text-sm font-semibold ${CATEGORY_TEXT[cat]}`}>
                            {INVESTMENT_CATEGORY_NAMES[cat]}
                          </p>
                          <p className="text-xs text-gray-500">{INVESTMENT_CATEGORY_DESCRIPTIONS[cat]}</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        {!isReadOnly && (
                          <button
                            onClick={() => {
                              setAddingTo({ category: cat, name: '', amount: '' });
                              setExpanded((p) => ({ ...p, [cat]: true }));
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            <Plus size={12} /> 添加账户
                          </button>
                        )}
                        <button
                          onClick={() => setExpanded((p) => ({ ...p, [cat]: !p[cat] }))}
                          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                        >
                          <span className="text-sm font-medium">{formatCNY(catTotal + catInsurance)}</span>
                          {isOpen ? (
                            <ChevronUp size={14} className="text-gray-500" />
                          ) : (
                            <ChevronDown size={14} className="text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden border-t border-white/5"
                        >
                          <div className="divide-y divide-white/5">
                            {catAccounts.length === 0 && insurancePoliciesByCategory[cat].length === 0 && (
                              <p className="px-4 py-3 text-xs text-gray-600 text-center">暂无账户</p>
                            )}
                            {catAccounts.map((account, idx) => {
                              const isEditing =
                                editingAccount?.category === cat && editingAccount?.index === idx;
                              return (
                                <div key={idx} className="flex items-center gap-3 px-4 py-2.5 group">
                                  <span className="text-sm text-gray-300 flex-1 truncate">
                                    {account.name}
                                  </span>
                                  {isEditing ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        value={editingAccount!.value}
                                        onChange={(e) =>
                                          setEditingAccount((p) =>
                                            p ? { ...p, value: e.target.value } : null
                                          )
                                        }
                                        className="w-28 bg-black-elevated border border-indigo-500/50 rounded px-2 py-1 text-white text-sm"
                                        autoFocus
                                      />
                                      <button
                                        onClick={handleSaveEdit}
                                        className="text-emerald-400 hover:text-emerald-300 p-1"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button
                                        onClick={() => setEditingAccount(null)}
                                        className="text-gray-500 hover:text-gray-300 p-1"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-3">
                                      <FreshnessIndicator date={account.updatedAt} />
                                      <span className="text-sm font-mono text-gray-200">
                                        {formatCNY(account.amount)}
                                      </span>
                                      {!isReadOnly && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={() =>
                                              setEditingAccount({
                                                category: cat,
                                                index: idx,
                                                value: String(account.amount),
                                              })
                                            }
                                            className="text-gray-500 hover:text-white p-1"
                                          >
                                            <Pencil size={12} />
                                          </button>
                                          <button
                                            onClick={() => store.deleteAccount(cat, idx)}
                                            className="text-gray-500 hover:text-red-400 p-1"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {/* Insurance policies in this category */}
                            {insurancePoliciesByCategory[cat].map((policy) => (
                              <div key={policy.id} className="flex items-center gap-3 px-4 py-2.5">
                                <span className="text-sm text-gray-300 flex-1 truncate">
                                  {policy.name}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  保单
                                </span>
                                <span className="text-sm font-mono text-gray-200">
                                  {formatCNY(policy.cashValue)}
                                </span>
                              </div>
                            ))}

                            {/* Emergency fund coverage indicator */}
                            {cat === 'emergency' && (() => {
                              const ma3 = store.getMA3Spending();
                              const months = ma3 > 0 ? catTotal / ma3 : 0;
                              const coverColor = months >= 6 ? 'text-emerald-400' : months >= 3 ? 'text-amber-400' : 'text-red-400';
                              return (
                                <div className="px-4 py-2.5 flex items-center justify-between border-t border-white/5 bg-white/2">
                                  <span className="text-xs text-gray-500">应急覆盖</span>
                                  <span className={`text-xs font-mono ${coverColor}`}>
                                    {ma3 > 0 ? `已覆盖 ${months.toFixed(1)} 个月 · 目标 6 个月` : '暂无支出数据'}
                                  </span>
                                </div>
                              );
                            })()}

                            {/* Add row */}
                            {!isReadOnly && (
                              addingTo?.category === cat ? (
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/3">
                                  <input
                                    type="text"
                                    value={addingTo!.name}
                                    onChange={(e) =>
                                      setAddingTo((p) => (p ? { ...p, name: e.target.value } : null))
                                    }
                                    placeholder="账户名称"
                                    className="flex-1 bg-black-elevated border border-white/10 rounded px-2 py-1 text-white text-sm placeholder:text-gray-600"
                                    autoFocus
                                  />
                                  <input
                                    type="number"
                                    value={addingTo!.amount}
                                    onChange={(e) =>
                                      setAddingTo((p) => (p ? { ...p, amount: e.target.value } : null))
                                    }
                                    placeholder="金额"
                                    className="w-28 bg-black-elevated border border-white/10 rounded px-2 py-1 text-white text-sm placeholder:text-gray-600"
                                  />
                                  <button
                                    onClick={handleSaveAdd}
                                    className="text-emerald-400 hover:text-emerald-300 p-1"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => setAddingTo(null)}
                                    className="text-gray-500 hover:text-gray-300 p-1"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : null
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </WealthCard>
                );
              })}

              <Card className="py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">净资产合计</span>
                  <span className="text-lg font-bold font-mono text-white">
                    {formatCNY(totalNetWorth)}
                  </span>
                </div>
                {totalCashValue > 0 && (
                  <p className="text-xs text-gray-600 mt-1 text-right">
                    账户 {formatCNY(totalInvestments)} + 保单 {formatCNY(totalCashValue)}
                  </p>
                )}
              </Card>
            </motion.div>
          )}

          {/* ─── Insurance Policies ─── */}
          {activeTab === 'insurance' && (
            <motion.div
              key="insurance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Insurance Summary */}
              <InsuranceSummary
                totalAnnualPremiums={totalAnnualPremiums}
                totalCashValue={totalCashValue}
                totalCoverageAmount={totalCoverageAmount}
                monthlyPremiumCost={monthlyPremiumCost}
                onOpenGapAnalysis={() => setShowGapAnalysis(true)}
                hasUserProfile={!!userProfile}
              />

              {/* Gap Analysis Modal */}
              <AnimatePresence>
                {showGapAnalysis && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowGapAnalysis(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-black-elevated border border-white/10 rounded-2xl p-6 shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-white">保障缺口分析</h3>
                        <button
                          onClick={() => setShowGapAnalysis(false)}
                          className="text-gray-500 hover:text-gray-300 p-1"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      {gapResult ? (
                        <InsuranceGapChart result={gapResult} />
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                          <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                          <div>
                            <h4 className="text-sm font-bold text-amber-500">需完善个人档案</h4>
                            <p className="text-xs text-amber-500/80 mt-0.5">
                              请前往设置页面完善个人信息，以便进行保险缺口分析。
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Policy list */}
              {policies.length === 0 ? (
                <Card className="py-12 text-center">
                  <Shield size={32} className="mx-auto mb-3 text-gray-700" />
                  <p className="text-sm text-gray-500">暂无保险保单</p>
                  <p className="text-xs text-gray-600 mt-1">点击上方「录入保险」按钮添加保单</p>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Categorized Policies */}
                  {insuranceCategories.map((cat) => {
                    const catPolicies = groupedPolicies[cat];
                    if (!catPolicies?.length) return null;

                    return (
                      <div key={cat} className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <div
                            className="w-1 h-4 rounded-full"
                            style={{ backgroundColor: INSURANCE_CATEGORY_COLORS[cat] }}
                          />
                          <h3 className="text-sm font-bold text-white">
                            {INSURANCE_CATEGORY_LABELS[cat]}
                          </h3>
                          <span className="text-xs text-gray-500">
                            ({catPolicies.length})
                          </span>
                        </div>

                        {catPolicies.map((policy) => (
                          <PolicyCard
                            key={policy.id}
                            policy={policy}
                            isReadOnly={isReadOnly}
                            onEdit={(p) => {
                              setEditingPolicy(p);
                              setIsBatchMode(false);
                              setShowAdd(true);
                            }}
                            onDelete={(id) => store.deletePolicy(id)}
                          />
                        ))}
                      </div>
                    );
                  })}

                  {/* Other / Uncategorized */}
                  {groupedPolicies['other']?.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-1 h-4 rounded-full bg-gray-600" />
                        <h3 className="text-sm font-bold text-white">未分类</h3>
                        <span className="text-xs text-gray-500">
                          ({groupedPolicies['other'].length})
                        </span>
                      </div>
                      {groupedPolicies['other'].map((policy) => (
                        <PolicyCard
                          key={policy.id}
                          policy={policy}
                          isReadOnly={isReadOnly}
                          onEdit={(p) => {
                            setEditingPolicy(p);
                            setIsBatchMode(false);
                            setShowAdd(true);
                          }}
                          onDelete={(id) => store.deletePolicy(id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Risk Leverage */}
              <Card>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">抗风险杠杆率</p>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-emerald-400">
                      {riskLeverageRatio.toFixed(1)}x
                    </span>
                    <p className="text-xs text-gray-500 mt-1">保障总额 / 年支出估算</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-gray-300">{formatCNY(totalCoverageAmount)}</p>
                    <p className="text-xs text-gray-600">保障总额</p>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  目标：杠杆率 ≥ 10x &nbsp;·&nbsp;
                  {riskLeverageRatio >= 10 ? (
                    <span className="text-emerald-400">已达标</span>
                  ) : (
                    <span className="text-amber-400">未达标，建议增加保障额度</span>
                  )}
                </div>
              </Card>

              {/* Premium summary */}
              {policies.length > 0 && (
                <Card>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">保费支出摘要</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">年度保费</p>
                      <p className="text-base font-bold font-mono text-indigo-400">
                        {formatCNY(totalAnnualPremiums)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">月均支出</p>
                      <p className="text-base font-bold font-mono text-indigo-400">
                        {formatCNY(monthlyPremiumCost)}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}
