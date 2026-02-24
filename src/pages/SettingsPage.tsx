import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Users,
  Sliders,
  User,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  FlaskConical,
  BookOpen,
  Download,
  Upload,
  LogOut,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { EXAMPLE_PROFILE_METADATA } from '../data/exampleProfiles';
import { ROUTES, CITY_TIER_NAMES, MARITAL_STATUS_NAMES, RISK_TOLERANCE_NAMES } from '../utils/constants';
import type { WorkspaceMode } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AllocationDraft {
  growth: number;
  stability: number;
  essentials: number;
  rewards: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' as const },
  }),
};

const ALLOCATION_META: {
  key: keyof AllocationDraft;
  label: string;
  color: string;
  trackColor: string;
  thumbColor: string;
}[] = [
  {
    key: 'growth',
    label: '增长投资',
    color: 'text-emerald-400',
    trackColor: 'bg-emerald-500',
    thumbColor: '#10B981',
  },
  {
    key: 'stability',
    label: '稳健储蓄',
    color: 'text-blue-400',
    trackColor: 'bg-blue-500',
    thumbColor: '#3B82F6',
  },
  {
    key: 'essentials',
    label: '基本开支',
    color: 'text-amber-400',
    trackColor: 'bg-amber-500',
    thumbColor: '#F59E0B',
  },
  {
    key: 'rewards',
    label: '享乐奖励',
    color: 'text-pink-400',
    trackColor: 'bg-pink-500',
    thumbColor: '#EC4899',
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Colored mode badge */
function ModeBadge({ mode }: { mode: WorkspaceMode }) {
  const cfg: Record<WorkspaceMode, { label: string; className: string }> = {
    PERSONAL: { label: '个人模式', className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
    SANDBOX:  { label: '沙盒模式', className: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
    EXAMPLE:  { label: '案例模式', className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  };
  const { label, className } = cfg[mode];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

/** Section header */
function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="mt-0.5 text-gold-primary">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Allocation slider row */
function AllocationSlider({
  meta,
  value,
  onChange,
}: {
  meta: (typeof ALLOCATION_META)[number];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
        <span className="text-sm font-bold text-white tabular-nums">{value}%</span>
      </div>
      <div className="relative h-2 rounded-full bg-gray-800">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${meta.trackColor} transition-all duration-150`}
          style={{ width: `${value}%` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ accentColor: meta.thumbColor }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const navigate = useNavigate();

  const {
    activeMode,
    activeExampleId,
    switchMode,
    createSandbox,
    clearSandbox,
    updateSettings,
    resetAll,
    getCurrentData,
    sandboxData,
    isAuthenticated,
    setAuthenticated,
  } = useAppStore();

  const currentData = getCurrentData();
  const { settings, userProfile } = currentData;

  // Allocation draft state — initialized from store settings or defaults
  const [draft, setDraft] = useState<AllocationDraft>({
    growth:     settings?.targetAllocation?.growth     ?? 25,
    stability:  settings?.targetAllocation?.stability  ?? 15,
    essentials: settings?.targetAllocation?.essentials ?? 50,
    rewards:    settings?.targetAllocation?.rewards    ?? 10,
  });
  const [allocationSaved, setAllocationSaved] = useState(false);

  // Example picker state
  const [selectedExampleId, setSelectedExampleId] = useState<string>(
    activeExampleId ?? EXAMPLE_PROFILE_METADATA[0].id
  );
  const [exampleDropdownOpen, setExampleDropdownOpen] = useState(false);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Allocation sum
  const allocationSum = draft.growth + draft.stability + draft.essentials + draft.rewards;
  const allocationValid = allocationSum === 100;

  // Handle slider change — clamp to prevent going below 0
  const handleSliderChange = useCallback(
    (key: keyof AllocationDraft, value: number) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
      setAllocationSaved(false);
    },
    []
  );

  // Save allocation
  const handleSaveAllocation = () => {
    if (!allocationValid) return;
    updateSettings({ targetAllocation: { ...draft } });
    setAllocationSaved(true);
    setTimeout(() => setAllocationSaved(false), 2000);
  };

  // Reset all data
  const handleResetAll = () => {
    resetAll();
    setShowResetConfirm(false);
    navigate(ROUTES.ONBOARDING);
  };

  // Download Sandbox Data
  const handleDownloadSandbox = () => {
    if (!sandboxData) return;
    const blob = new Blob([JSON.stringify(sandboxData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hi-money-sandbox-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Upload Sandbox Data
  const handleUploadSandbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Simple validation
        if (typeof json === 'object' && json !== null) {
            createSandbox(json);
        } else {
            alert('Invalid JSON file');
        }
      } catch (err) {
        console.error('Failed to parse JSON', err);
        alert('Failed to parse JSON file');
      }
      // Reset input
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Selected example metadata
  const selectedExampleMeta =
    EXAMPLE_PROFILE_METADATA.find((m) => m.id === selectedExampleId) ??
    EXAMPLE_PROFILE_METADATA[0];

  return (
    <PageContainer gradient={false}>
      <div className="max-w-4xl mx-auto pb-20 pt-10 space-y-6">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-white mb-1">设置</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-400">当前工作区</p>
            <ModeBadge mode={activeMode} />
          </div>
        </motion.div>

        {/* ------------------------------------------------------------------ */}
        {/* Section 1: Workspace Mode                                          */}
        {/* ------------------------------------------------------------------ */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <SectionHeader
              icon={<Briefcase size={20} />}
              title="工作区模式"
              subtitle="切换数据来源，不同模式之间相互隔离"
            />

            <div className="space-y-3">
              {/* Personal mode */}
              <div
                className={`flex items-center justify-between rounded-xl border p-4 transition-all duration-200 ${
                  activeMode === 'PERSONAL'
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-gray-700 bg-gray-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <User size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">个人模式</p>
                    <p className="text-xs text-gray-400 mt-0.5">您的真实数据，安全保存</p>
                  </div>
                </div>
                {activeMode === 'PERSONAL' ? (
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                ) : (
                  <button
                    onClick={() => switchMode('PERSONAL')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                  >
                    切换
                  </button>
                )}
              </div>

              {/* Example mode */}
              <div
                className={`rounded-xl border p-4 transition-all duration-200 ${
                  activeMode === 'EXAMPLE'
                    ? 'border-blue-500/50 bg-blue-500/5'
                    : 'border-gray-700 bg-gray-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <BookOpen size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">案例模式</p>
                      <p className="text-xs text-gray-400 mt-0.5">浏览预置案例，只读模式</p>
                    </div>
                  </div>
                  {activeMode === 'EXAMPLE' && (
                    <CheckCircle2 size={18} className="text-blue-400 shrink-0" />
                  )}
                </div>

                {/* Example picker dropdown */}
                <div className="relative mb-3">
                  <button
                    onClick={() => setExampleDropdownOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white hover:border-blue-500/40 transition-colors"
                  >
                    <span>{selectedExampleMeta.label}</span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform duration-200 ${
                        exampleDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {exampleDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{ transformOrigin: 'top' }}
                        className="absolute z-50 top-full mt-1 left-0 right-0 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl overflow-hidden"
                      >
                        {EXAMPLE_PROFILE_METADATA.map((meta) => (
                          <button
                            key={meta.id}
                            onClick={() => {
                              setSelectedExampleId(meta.id);
                              setExampleDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-800 transition-colors ${
                              selectedExampleId === meta.id ? 'bg-blue-500/10' : ''
                            }`}
                          >
                            <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                              <Users size={11} className="text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">{meta.label}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                                  {meta.tag}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                {meta.description}
                              </p>
                              <p className="text-xs text-blue-400 mt-0.5">{meta.incomeLabel}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selected example description */}
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                  {selectedExampleMeta.description}
                </p>

                <button
                  onClick={() => switchMode('EXAMPLE', selectedExampleId)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                >
                  加载案例
                </button>
              </div>

              {/* Sandbox mode */}
              <div
                className={`rounded-xl border p-4 transition-all duration-200 ${
                  activeMode === 'SANDBOX'
                    ? 'border-amber-500/50 bg-amber-500/5'
                    : 'border-gray-700 bg-gray-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <FlaskConical size={16} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">客户沙盒</p>
                      <p className="text-xs text-gray-400 mt-0.5">临时演示空间，不影响个人数据</p>
                    </div>
                  </div>
                  {activeMode === 'SANDBOX' && (
                    <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                  )}
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {activeMode !== 'SANDBOX' && sandboxData && (
                    <button
                      onClick={() => switchMode('SANDBOX')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                    >
                      回到沙盒
                    </button>
                  )}
                  <button
                    onClick={() => createSandbox()}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 text-gray-300 hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
                  >
                    新建沙盒
                  </button>
                  
                  {/* Download/Upload */}
                  {sandboxData && (
                    <>
                      <button
                        onClick={handleDownloadSandbox}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 text-gray-300 hover:bg-white/10 transition-colors"
                        title="导出沙盒数据"
                      >
                        <Download size={14} /> 导出
                      </button>
                    </>
                  )}
                  
                  <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 text-gray-300 hover:bg-white/10 transition-colors cursor-pointer">
                    <Upload size={14} /> 导入
                    <input 
                      type="file" 
                      accept=".json" 
                      className="hidden" 
                      onChange={handleUploadSandbox}
                    />
                  </label>

                  {sandboxData && (
                    <button
                      onClick={() => clearSandbox()}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      清除沙盒
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ------------------------------------------------------------------ */}
        {/* Section 2: Target Allocation                                       */}
        {/* ------------------------------------------------------------------ */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <SectionHeader
              icon={<Sliders size={20} />}
              title="目标配比调整"
              subtitle="自定义收入分配比例（合计须为 100%）"
            />

            <div className="space-y-5">
              {ALLOCATION_META.map((meta) => (
                <AllocationSlider
                  key={meta.key}
                  meta={meta}
                  value={draft[meta.key]}
                  onChange={(v) => handleSliderChange(meta.key, v)}
                />
              ))}
            </div>

            {/* Live sum preview */}
            <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-900/60 border border-gray-700 px-4 py-3">
              <span className="text-sm text-gray-400">当前合计</span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  allocationValid ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {allocationSum}%
              </span>
            </div>

            {/* Pie preview bar */}
            <div className="mt-3 flex h-2 rounded-full overflow-hidden gap-0.5">
              {ALLOCATION_META.map((meta) => (
                <div
                  key={meta.key}
                  className={`${meta.trackColor} transition-all duration-200`}
                  style={{ width: `${(draft[meta.key] / Math.max(allocationSum, 1)) * 100}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              {ALLOCATION_META.map((meta) => (
                <div key={meta.key} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${meta.trackColor}`} />
                  <span className="text-xs text-gray-400">
                    {meta.label} {draft[meta.key]}%
                  </span>
                </div>
              ))}
            </div>

            {/* Validation warning */}
            <AnimatePresence>
              {!allocationValid && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3">
                    <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-300 leading-relaxed">
                      四项合计为 {allocationSum}%，需调整至 100% 才能保存
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save button */}
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={handleSaveAllocation}
                disabled={!allocationValid}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  allocationValid
                    ? 'bg-gold-primary text-black-primary hover:opacity-90 active:scale-95'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {allocationSaved ? (
                  <>
                    <CheckCircle2 size={15} />
                    已保存
                  </>
                ) : (
                  '保存配比'
                )}
              </button>
              <button
                onClick={() =>
                  setDraft({ growth: 25, stability: 15, essentials: 50, rewards: 10 })
                }
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                恢复默认 (25-15-50-10)
              </button>
            </div>
          </Card>
        </motion.div>

        {/* ------------------------------------------------------------------ */}
        {/* Section 3: Profile Info                                            */}
        {/* ------------------------------------------------------------------ */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <SectionHeader
              icon={<User size={20} />}
              title="个人信息"
              subtitle="您的基础画像，用于智能推荐"
            />

            {userProfile ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: '年龄', value: `${userProfile.age} 岁` },
                    {
                      label: '所在城市',
                      value: CITY_TIER_NAMES[userProfile.cityTier] ?? `${userProfile.cityTier}线城市`,
                    },
                    {
                      label: '婚姻状况',
                      value: MARITAL_STATUS_NAMES[userProfile.maritalStatus] ?? userProfile.maritalStatus,
                    },
                    {
                      label: '风险偏好',
                      value: RISK_TOLERANCE_NAMES[userProfile.riskTolerance] ?? userProfile.riskTolerance,
                    },
                    {
                      label: '月收入',
                      value: `¥${userProfile.monthlyIncome.toLocaleString()}`,
                    },
                    {
                      label: '退休目标',
                      value: `${userProfile.retirementAge} 岁`,
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-xl bg-gray-900/60 border border-gray-800 px-4 py-3"
                    >
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className="text-sm font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate(ROUTES.ONBOARDING)}
                  className="mt-1 flex items-center gap-2 text-sm text-gold-primary hover:opacity-80 transition-opacity"
                >
                  <RefreshCw size={14} />
                  重新填写
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-4">尚未完成个人画像</p>
                <button
                  onClick={() => navigate(ROUTES.ONBOARDING)}
                  className="px-4 py-2 rounded-xl bg-gold-primary text-black-primary text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
                >
                  立即填写
                </button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ------------------------------------------------------------------ */}
        {/* Section 4: Data Management                                         */}
        {/* ------------------------------------------------------------------ */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <SectionHeader
              icon={<AlertTriangle size={20} />}
              title="数据管理"
              subtitle="危险操作，请谨慎"
            />

            <AnimatePresence mode="wait">
              {!showResetConfirm ? (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-sm text-gray-400 mb-4">
                    重置后所有个人数据（资产、支出、保险、画像）将被清空且不可恢复。
                  </p>
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <AlertTriangle size={15} />
                    重置所有数据
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 mb-4">
                    <div className="flex items-start gap-2 mb-3">
                      <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-300 font-semibold">确认重置？此操作不可撤销。</p>
                    </div>
                    <p className="text-xs text-red-400/70 pl-6">
                      所有资产、支出记录、保险方案及个人画像将被永久删除，并跳转至引导页。
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleResetAll}
                      className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all"
                    >
                      确认重置
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-sm font-semibold hover:bg-gray-700 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* ------------------------------------------------------------------ */}
        {/* Section 5: Account / Logout                                       */}
        {/* ------------------------------------------------------------------ */}
        {isAuthenticated && (
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
            <Card>
              <SectionHeader
                icon={<LogOut size={20} />}
                title="账户"
                subtitle="登录状态管理"
              />
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setAuthenticated(false);
                  navigate(ROUTES.WELCOME);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-sm font-semibold text-white hover:bg-gray-700 transition-colors active:scale-95"
              >
                <LogOut size={15} />
                退出登录
              </button>
            </Card>
          </motion.div>
        )}

        {/* Bottom spacer for floating nav */}
        <div className="h-8" />
      </div>
    </PageContainer>
  );
}
