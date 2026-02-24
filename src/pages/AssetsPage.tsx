import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Shield,
  TrendingUp,
  Landmark,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { PolicyForm } from '../components/insurance/PolicyForm';
import { InsuranceGapChart } from '../components/insurance/InsuranceGapChart';
import { FreshnessIndicator } from '../components/common/FreshnessIndicator';
import { formatCNY } from '../lib/format';
import {
  getTotalCashValue,
  getTotalAnnualPremiums,
  getTotalCoverage,
  getMonthlyPremiumCost,
} from '../algorithms/insuranceDispatch';
import { calculateInsuranceGap } from '../algorithms/insuranceCalculator';
import type { InvestmentCategoryType } from '../types';
import type { InsurancePolicy, InsuranceCategory } from '../types/insurance.types';
import type { InsuranceProfile } from '../types/profile.types';
import {
  INVESTMENT_CATEGORY_NAMES,
  INVESTMENT_CATEGORY_DESCRIPTIONS,
} from '../utils/constants';
import {
  INSURANCE_CATEGORY_LABELS,
  INSURANCE_CATEGORY_COLORS,
  INSURANCE_SUBCATEGORY_LABELS
} from '../utils/insuranceConstants';

type TabType = 'investments' | 'insurance' | 'networth';

const CATEGORY_TEXT: Record<InvestmentCategoryType, string> = {
  growth: 'text-emerald-400',
  stability: 'text-blue-400',
  special: 'text-violet-400',
};

const CATEGORY_ICON: Record<InvestmentCategoryType, React.ReactNode> = {
  growth: <TrendingUp size={16} />,
  stability: <Landmark size={16} />,
  special: <Shield size={16} />,
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

  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);

  const totalInvestments = store.getTotalAssets() - getTotalCashValue(policies);
  const totalCashValue = getTotalCashValue(policies);
  const totalNetWorth = totalInvestments + totalCashValue;
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
      const type = p.subCategory || p.type;
      
      if (type === 'medical' || type === 'supplementaryMedical') {
        profile.existingCoverage.medicalInsurance += amount;
        profile.existingCoverageAmount.medical += amount;
      } else if (['termLife', 'wholeLife', 'increasingWholeLife', 'endowment', 'life'].includes(type)) {
        profile.existingCoverage.lifeInsurance += amount;
        profile.existingCoverageAmount.life += amount;
      } else if (type === 'criticalIllness') {
        profile.existingCoverage.criticalIllness += amount;
        profile.existingCoverageAmount.criticalIllness += amount;
      } else if (type === 'accident' || type === 'groupAccident') {
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

  const insuranceCategories: InsuranceCategory[] = ['protection', 'savings', 'investment', 'group'];

  const categories: InvestmentCategoryType[] = ['growth', 'stability', 'special'];

  const tabs: { key: TabType; label: string }[] = [
    { key: 'investments', label: '投资账户' },
    { key: 'insurance', label: '保险保单' },
    { key: 'networth', label: '净资产' },
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

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto pb-20 pt-10 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">资产管理</h1>
          <p className="text-gray-400 text-sm mt-1">管理投资账户、保险保单与净资产概览</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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
              {categories.map((cat) => {
                const catAccounts = accounts[cat] ?? [];
                const isOpen = expanded[cat];
                const catTotal = catAccounts.reduce((sum, a) => sum + a.amount, 0);
                return (
                  <Card key={cat} className="overflow-hidden p-0">
                    <button
                      onClick={() => setExpanded((p) => ({ ...p, [cat]: !p[cat] }))}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={CATEGORY_TEXT[cat]}>{CATEGORY_ICON[cat]}</span>
                        <div className="text-left">
                          <p className={`text-sm font-semibold ${CATEGORY_TEXT[cat]}`}>
                            {INVESTMENT_CATEGORY_NAMES[cat]}
                          </p>
                          <p className="text-xs text-gray-500">{INVESTMENT_CATEGORY_DESCRIPTIONS[cat]}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-300">{formatCNY(catTotal)}</span>
                        {isOpen ? (
                          <ChevronUp size={14} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={14} className="text-gray-500" />
                        )}
                      </div>
                    </button>

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
                            {catAccounts.length === 0 && (
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
                                        value={editingAccount.value}
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

                            {/* Add row */}
                            {!isReadOnly && (
                              addingTo?.category === cat ? (
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/3">
                                  <input
                                    type="text"
                                    value={addingTo.name}
                                    onChange={(e) =>
                                      setAddingTo((p) => (p ? { ...p, name: e.target.value } : null))
                                    }
                                    placeholder="账户名称"
                                    className="flex-1 bg-black-elevated border border-white/10 rounded px-2 py-1 text-white text-sm placeholder:text-gray-600"
                                    autoFocus
                                  />
                                  <input
                                    type="number"
                                    value={addingTo.amount}
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
                              ) : (
                                <button
                                  onClick={() => setAddingTo({ category: cat, name: '', amount: '' })}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-colors"
                                >
                                  <Plus size={12} /> 添加账户
                                </button>
                              )
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}

              <Card className="py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">投资账户合计</span>
                  <span className="text-lg font-bold font-mono text-white">
                    {formatCNY(totalInvestments)}
                  </span>
                </div>
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
              {/* Gap Analysis Toggle */}
              {userProfile && (
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => setShowGapAnalysis(!showGapAnalysis)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      showGapAnalysis 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Shield size={14} />
                    {showGapAnalysis ? '隐藏保障缺口分析' : '显示保障缺口分析'}
                  </button>
                </div>
              )}

              {/* Gap Analysis Chart */}
              <AnimatePresence>
                {showGapAnalysis && gapResult && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <InsuranceGapChart result={gapResult} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!userProfile && showGapAnalysis && (
                <Card className="mb-4 bg-amber-500/10 border-amber-500/30">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-amber-500" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-amber-500">需完善个人档案</h4>
                      <p className="text-xs text-amber-500/80 mt-0.5">
                        请前往设置页面完善个人信息，以便进行保险缺口分析。
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Triple-dispatch summary */}
              <Card>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">三重调度总览</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '年度保费', value: totalAnnualPremiums, color: 'text-indigo-400', desc: '→ 支出预算' },
                    { label: '现金价值', value: totalCashValue, color: 'text-blue-400', desc: '→ 净资产' },
                    { label: '保障总额', value: totalCoverageAmount, color: 'text-emerald-400', desc: '→ 抗风险杠杆' },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className={`text-xs ${item.color} mb-1`}>{item.desc}</p>
                      <p className="text-sm font-bold font-mono text-white">{formatCNY(item.value)}</p>
                      <p className="text-xs text-gray-500">{item.label}</p>
                    </div>
                  ))}
                </div>
                {monthlyPremiumCost > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs text-gray-500">
                    <span>月均保费支出</span>
                    <span className="text-gray-300">{formatCNY(monthlyPremiumCost)} / 月</span>
                  </div>
                )}
              </Card>

              {/* Policy list */}
              {policies.length === 0 ? (
                <Card className="py-12 text-center">
                  <Shield size={32} className="mx-auto mb-3 text-gray-700" />
                  <p className="text-sm text-gray-500">暂无保险保单</p>
                  <p className="text-xs text-gray-600 mt-1">点击下方按钮添加保单</p>
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
                          <Card key={policy.id} className="space-y-3 relative overflow-hidden">
                            {policy.isTaxAdvantaged && (
                              <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-bl-lg font-medium border-l border-b border-emerald-500/10">
                                税优
                              </div>
                            )}
                            <div className="flex items-start justify-between pr-8">
                              <div>
                                <p className="text-sm font-semibold text-white">{policy.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                    {policy.subCategory
                                      ? INSURANCE_SUBCATEGORY_LABELS[policy.subCategory]
                                      : policy.type}
                                  </span>
                                </div>
                              </div>
                              {!isReadOnly && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingPolicy(policy);
                                      setShowPolicyForm(true);
                                    }}
                                    className="text-gray-500 hover:text-white p-1.5 rounded hover:bg-white/5"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    onClick={() => store.deletePolicy(policy.id)}
                                    className="text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-white/5"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                {
                                  label: '年保费',
                                  value: policy.annualPremium,
                                  color: 'text-indigo-400',
                                  desc: '→ 支出',
                                },
                                {
                                  label: '现金价值',
                                  value: policy.cashValue,
                                  color: 'text-blue-400',
                                  desc: '→ 资产',
                                },
                                {
                                  label: '保障额度',
                                  value: policy.coverageAmount,
                                  color: 'text-emerald-400',
                                  desc: '→ 杠杆',
                                },
                              ].map((item) => (
                                <div
                                  key={item.label}
                                  className="bg-black-soft rounded-lg p-2 text-center"
                                >
                                  <p className={`text-xs ${item.color} mb-1`}>{item.desc}</p>
                                  <p className="text-xs font-mono font-semibold text-white">
                                    {formatCNY(item.value)}
                                  </p>
                                  <p className="text-xs text-gray-600">{item.label}</p>
                                </div>
                              ))}
                            </div>
                          </Card>
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
                        <Card key={policy.id} className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-white">{policy.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{policy.type}</p>
                            </div>
                            {!isReadOnly && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingPolicy(policy);
                                    setShowPolicyForm(true);
                                  }}
                                  className="text-gray-500 hover:text-white p-1.5 rounded hover:bg-white/5"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => store.deletePolicy(policy.id)}
                                  className="text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-white/5"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              {
                                label: '年保费',
                                value: policy.annualPremium,
                                color: 'text-indigo-400',
                                desc: '→ 支出',
                              },
                              {
                                label: '现金价值',
                                value: policy.cashValue,
                                color: 'text-blue-400',
                                desc: '→ 资产',
                              },
                              {
                                label: '保障额度',
                                value: policy.coverageAmount,
                                color: 'text-emerald-400',
                                desc: '→ 杠杆',
                              },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className="bg-black-soft rounded-lg p-2 text-center"
                              >
                                <p className={`text-xs ${item.color} mb-1`}>{item.desc}</p>
                                <p className="text-xs font-mono font-semibold text-white">
                                  {formatCNY(item.value)}
                                </p>
                                <p className="text-xs text-gray-600">{item.label}</p>
                              </div>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!isReadOnly && (
                <button
                  onClick={() => {
                    setEditingPolicy(null);
                    setShowPolicyForm(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/15 text-sm text-gray-500 hover:text-gray-300 hover:border-white/30 transition-all"
                >
                  <Plus size={15} /> 添加保险保单
                </button>
              )}

              {/* Policy form modal */}
              {showPolicyForm && !isReadOnly && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-indigo-600/40">
                    <h3 className="text-base font-semibold text-white mb-4">
                      {editingPolicy ? '编辑保单' : '新增保单'}
                    </h3>
                    <PolicyForm
                      initial={editingPolicy ?? undefined}
                      onSave={(policy) => {
                        if (editingPolicy) {
                          store.updatePolicy(editingPolicy.id, policy);
                        } else {
                          store.addPolicy(policy);
                        }
                        setShowPolicyForm(false);
                        setEditingPolicy(null);
                      }}
                      onCancel={() => {
                        setShowPolicyForm(false);
                        setEditingPolicy(null);
                      }}
                    />
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─── Net Worth Summary ─── */}
          {activeTab === 'networth' && (
            <motion.div
              key="networth"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Breakdown */}
              <div className="space-y-3">
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={15} className="text-emerald-400" />
                      <span className="text-sm text-gray-300">投资账户合计</span>
                    </div>
                    <span className="text-base font-bold font-mono text-white">
                      {formatCNY(totalInvestments)}
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    {categories.map((cat) => {
                      const total = (accounts[cat] ?? []).reduce((s, a) => s + a.amount, 0);
                      return (
                        <div key={cat} className="flex justify-between text-xs">
                          <span className={`${CATEGORY_TEXT[cat]} opacity-80`}>
                            {INVESTMENT_CATEGORY_NAMES[cat]}
                          </span>
                          <span className="text-gray-500 font-mono">{formatCNY(total)}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield size={15} className="text-blue-400" />
                      <span className="text-sm text-gray-300">保单现金价值</span>
                    </div>
                    <span className="text-base font-bold font-mono text-white">
                      {formatCNY(totalCashValue)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1.5 pl-6">{policies.length} 份保单</p>
                </Card>

                <Card className="border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">总净资产</span>
                    <span className="text-xl font-bold font-mono text-white">
                      {formatCNY(totalNetWorth)}
                    </span>
                  </div>
                </Card>
              </div>

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
