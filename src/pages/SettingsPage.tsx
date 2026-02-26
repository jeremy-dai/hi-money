import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Users,
  User,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  FlaskConical,
  BookOpen,
  Download,
  Upload,
  LogOut,
  Edit2,
  Save,
  X,
  PieChart,
  BarChart2,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { EXAMPLE_PROFILE_METADATA } from '../data/exampleProfiles';
import {
  ROUTES,
  CITY_TIER_NAMES,
  MARITAL_STATUS_NAMES,
  RISK_TOLERANCE_NAMES,
  PRIMARY_GOAL_NAMES,
  ALLOCATION_COLORS,
  DEFAULT_ALLOCATION,
  INVESTMENT_CATEGORY_COLORS,
  INVESTMENT_CATEGORY_NAMES,
} from '../utils/constants';
import type { WorkspaceMode } from '../types';
import type { Allocation } from '../types/store.types';
import type { InvestmentPoolAllocation } from '../types/allocation.types';
import type { CityTier, MaritalStatus, RiskTolerance, PrimaryGoal } from '../types/profile.types';

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

/** Read-only display field */
function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-900/60 border border-gray-800 px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

/** Toggle switch */
function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
        value ? 'bg-gold-primary' : 'bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          value ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

/** Button group for selecting from a list of options */
function ButtonGroup({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            value === o.value
              ? 'bg-gold-primary/20 border-gold-primary/50 text-gold-primary'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Form row: label on left, input on right */
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-gray-400 w-20 shrink-0 pt-2 leading-tight">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

/** Section divider with title */
function FormDivider({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
        {title}
      </span>
      {note && <span className="text-xs text-gray-600 normal-case font-normal">{note}</span>}
      <div className="flex-1 h-px bg-gray-800" />
    </div>
  );
}

/** Shared number input style */
const numInput = (extra = '') =>
  `bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-gold-primary/60 transition-colors ${extra}`;

// ---------------------------------------------------------------------------
// Profile info section (view + inline edit)
// ---------------------------------------------------------------------------
function ProfileInfoSection() {
  const { getCurrentData, updateUserProfile, setUserProfile, activeMode } = useAppStore();
  const { userProfile } = getCurrentData();
  const isReadOnly = activeMode === 'EXAMPLE';

  const buildDraft = () => ({
    age:                      userProfile?.age ?? 30,
    cityTier:                 (userProfile?.cityTier ?? 1) as CityTier,
    maritalStatus:            (userProfile?.maritalStatus ?? 'single') as MaritalStatus,
    hasChildren:              userProfile?.hasChildren ?? false,
    childrenCount:            userProfile?.childrenCount ?? 0,
    monthlyIncome:            userProfile?.monthlyIncome ?? 0,
    hasMortgage:              userProfile?.hasMortgage ?? false,
    mortgageMonthly:          userProfile?.mortgageMonthly ?? 0,
    existingDebts:            userProfile?.existingDebts ?? 0,
    riskTolerance:            (userProfile?.riskTolerance ?? 'moderate') as RiskTolerance,
    primaryGoal:              (userProfile?.primaryGoal ?? 'retirement') as PrimaryGoal,
    retirementAge:            userProfile?.retirementAge ?? 60,
    dependents:               userProfile?.dependents ?? 0,
    parentsCare:              userProfile?.parentsCare ?? false,
    currentPensionContribution: userProfile?.currentPensionContribution ?? 0,
    expectedMonthlyExpense:   userProfile?.expectedMonthlyExpense ?? 0,
    desiredLifestyle:         (userProfile?.desiredLifestyle ?? 'comfortable') as 'basic' | 'comfortable' | 'affluent',
    retirementLocation:       (userProfile?.retirementLocation ?? 'tier2') as 'tier1' | 'tier2' | 'tier3' | 'tier4',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(buildDraft);

  const upd = <K extends keyof ReturnType<typeof buildDraft>>(
    key: K,
    value: ReturnType<typeof buildDraft>[K]
  ) => setDraft((d) => ({ ...d, [key]: value }));

  const startEditing = () => {
    setDraft(buildDraft());
    setIsEditing(true);
  };

  const handleSave = () => {
    if (userProfile) {
      updateUserProfile(draft);
    } else {
      setUserProfile({
        ...draft,
        childrenAges: [],
        profileCompleted: true,
        lastUpdated: new Date().toISOString(),
      });
    }
    setIsEditing(false);
  };

  // ---- View mode ----
  if (!isEditing) {
    return (
      <div className="space-y-3">
        {userProfile ? (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <ViewField label="年龄" value={`${userProfile.age} 岁`} />
              <ViewField
                label="城市"
                value={CITY_TIER_NAMES[userProfile.cityTier] ?? `${userProfile.cityTier}线城市`}
              />
              <ViewField label="婚姻状况" value={MARITAL_STATUS_NAMES[userProfile.maritalStatus]} />
              <ViewField
                label="子女"
                value={userProfile.hasChildren ? `${userProfile.childrenCount} 位` : '无'}
              />
              <ViewField label="月收入" value={`¥${userProfile.monthlyIncome.toLocaleString()}`} />
              <ViewField
                label="月供"
                value={userProfile.hasMortgage ? `¥${(userProfile.mortgageMonthly || 0).toLocaleString()}` : '无'}
              />
              {userProfile.existingDebts > 0 && (
                <ViewField label="现有负债" value={`¥${userProfile.existingDebts.toLocaleString()}`} />
              )}
              <ViewField label="风险偏好" value={RISK_TOLERANCE_NAMES[userProfile.riskTolerance]} />
              <ViewField label="主要目标" value={PRIMARY_GOAL_NAMES[userProfile.primaryGoal]} />
              <ViewField label="退休年龄" value={`${userProfile.retirementAge} 岁`} />
              {!!userProfile.dependents && userProfile.dependents > 0 && (
                <ViewField label="被抚养人" value={`${userProfile.dependents} 人`} />
              )}
              {userProfile.parentsCare && <ViewField label="赡养父母" value="是" />}
              {!!userProfile.expectedMonthlyExpense && userProfile.expectedMonthlyExpense > 0 && (
                <ViewField
                  label="退休月支出"
                  value={`¥${userProfile.expectedMonthlyExpense.toLocaleString()}`}
                />
              )}
            </div>
            {!isReadOnly && (
              <button
                onClick={startEditing}
                className="mt-1 flex items-center gap-1.5 text-sm text-gold-primary hover:opacity-80 transition-opacity"
              >
                <Edit2 size={13} />
                编辑个人信息
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-5">
            <p className="text-sm text-gray-500 mb-4">尚未设置个人信息</p>
            {!isReadOnly && (
              <button
                onClick={startEditing}
                className="px-4 py-2 rounded-xl bg-gold-primary text-black-primary text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                立即设置
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ---- Edit mode ----
  return (
    <div className="space-y-4">
      {/* 基本信息 */}
      <FormDivider title="基本信息" />

      <FieldRow label="年龄">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={18}
            max={80}
            value={draft.age}
            onChange={(e) => upd('age', Math.max(18, Math.min(80, parseInt(e.target.value) || 18)))}
            className={numInput('w-20')}
          />
          <span className="text-xs text-gray-500">岁</span>
        </div>
      </FieldRow>

      <FieldRow label="城市级别">
        <ButtonGroup
          value={String(draft.cityTier)}
          options={[
            { value: '1', label: '一线城市' },
            { value: '2', label: '二线城市' },
            { value: '3', label: '三线城市' },
            { value: '4', label: '四线城市' },
          ]}
          onChange={(v) => upd('cityTier', parseInt(v) as CityTier)}
        />
      </FieldRow>

      <FieldRow label="婚姻状况">
        <ButtonGroup
          value={draft.maritalStatus}
          options={[
            { value: 'single', label: '单身' },
            { value: 'married', label: '已婚' },
            { value: 'divorced', label: '离异' },
          ]}
          onChange={(v) => upd('maritalStatus', v as MaritalStatus)}
        />
      </FieldRow>

      <FieldRow label="有子女">
        <div className="flex items-center gap-3">
          <ToggleSwitch
            value={draft.hasChildren}
            onChange={(v) => {
              upd('hasChildren', v);
              if (!v) upd('childrenCount', 0);
            }}
          />
          {draft.hasChildren && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={8}
                value={draft.childrenCount || 1}
                onChange={(e) =>
                  upd('childrenCount', Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))
                }
                className={numInput('w-16')}
              />
              <span className="text-xs text-gray-500">位</span>
            </div>
          )}
        </div>
      </FieldRow>

      {/* 收入与负债 */}
      <FormDivider title="收入与负债" />

      <FieldRow label="月收入">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">¥</span>
          <input
            type="number"
            min={0}
            step={500}
            value={draft.monthlyIncome}
            onChange={(e) => upd('monthlyIncome', Math.max(0, parseInt(e.target.value) || 0))}
            className={numInput('w-36')}
          />
        </div>
      </FieldRow>

      <FieldRow label="有房贷">
        <div className="flex items-center gap-3">
          <ToggleSwitch
            value={draft.hasMortgage}
            onChange={(v) => {
              upd('hasMortgage', v);
              if (!v) upd('mortgageMonthly', 0);
            }}
          />
          {draft.hasMortgage && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">月供 ¥</span>
              <input
                type="number"
                min={0}
                step={100}
                value={draft.mortgageMonthly}
                onChange={(e) => upd('mortgageMonthly', Math.max(0, parseInt(e.target.value) || 0))}
                className={numInput('w-28')}
              />
            </div>
          )}
        </div>
      </FieldRow>

      <FieldRow label="现有负债">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">¥</span>
          <input
            type="number"
            min={0}
            step={1000}
            value={draft.existingDebts}
            onChange={(e) => upd('existingDebts', Math.max(0, parseInt(e.target.value) || 0))}
            className={numInput('w-36')}
          />
        </div>
      </FieldRow>

      {/* 理财目标 */}
      <FormDivider title="理财目标" />

      <FieldRow label="风险偏好">
        <ButtonGroup
          value={draft.riskTolerance}
          options={[
            { value: 'conservative', label: '保守型' },
            { value: 'moderate', label: '稳健型' },
            { value: 'aggressive', label: '进取型' },
          ]}
          onChange={(v) => upd('riskTolerance', v as RiskTolerance)}
        />
      </FieldRow>

      <FieldRow label="主要目标">
        <ButtonGroup
          value={draft.primaryGoal}
          options={[
            { value: 'retirement', label: '退休规划' },
            { value: 'house', label: '购房' },
            { value: 'education', label: '教育基金' },
            { value: 'wealth', label: '财富增长' },
            { value: 'security', label: '财务安全' },
          ]}
          onChange={(v) => upd('primaryGoal', v as PrimaryGoal)}
        />
      </FieldRow>

      <FieldRow label="退休年龄">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={50}
            max={70}
            value={draft.retirementAge}
            onChange={(e) =>
              upd('retirementAge', Math.max(50, Math.min(70, parseInt(e.target.value) || 60)))
            }
            className={numInput('w-20')}
          />
          <span className="text-xs text-gray-500">岁</span>
        </div>
      </FieldRow>

      {/* 保险与养老（可选） */}
      <FormDivider title="保险与养老" note="（可选）" />

      <FieldRow label="被抚养人">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={10}
            value={draft.dependents}
            onChange={(e) =>
              upd('dependents', Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))
            }
            className={numInput('w-16')}
          />
          <span className="text-xs text-gray-500">人</span>
        </div>
      </FieldRow>

      <FieldRow label="赡养父母">
        <ToggleSwitch
          value={draft.parentsCare}
          onChange={(v) => upd('parentsCare', v)}
        />
      </FieldRow>

      <FieldRow label="养老金月缴">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">¥</span>
          <input
            type="number"
            min={0}
            step={100}
            value={draft.currentPensionContribution}
            onChange={(e) =>
              upd('currentPensionContribution', Math.max(0, parseInt(e.target.value) || 0))
            }
            className={numInput('w-32')}
          />
        </div>
      </FieldRow>

      <FieldRow label="退休月支出">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">¥</span>
          <input
            type="number"
            min={0}
            step={500}
            value={draft.expectedMonthlyExpense}
            onChange={(e) =>
              upd('expectedMonthlyExpense', Math.max(0, parseInt(e.target.value) || 0))
            }
            className={numInput('w-32')}
          />
        </div>
      </FieldRow>

      <FieldRow label="生活标准">
        <ButtonGroup
          value={draft.desiredLifestyle}
          options={[
            { value: 'basic', label: '基本型' },
            { value: 'comfortable', label: '舒适型' },
            { value: 'affluent', label: '富裕型' },
          ]}
          onChange={(v) => upd('desiredLifestyle', v as 'basic' | 'comfortable' | 'affluent')}
        />
      </FieldRow>

      <FieldRow label="退休城市">
        <ButtonGroup
          value={draft.retirementLocation}
          options={[
            { value: 'tier1', label: '一线' },
            { value: 'tier2', label: '二线' },
            { value: 'tier3', label: '三线' },
            { value: 'tier4', label: '四线' },
          ]}
          onChange={(v) => upd('retirementLocation', v as 'tier1' | 'tier2' | 'tier3' | 'tier4')}
        />
      </FieldRow>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-primary text-black-primary text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
        >
          <Save size={14} />
          保存
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-sm font-semibold hover:bg-gray-700 transition-colors"
        >
          <X size={14} />
          取消
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared: segmented preview bar + footer for allocation sections
// ---------------------------------------------------------------------------
interface SegmentedBarProps {
  segments: { color: string; value: number }[];
  sum: number;
}

function SegmentedBar({ segments, sum }: SegmentedBarProps) {
  // When over 100, scale all segments down proportionally so they fit, then
  // show a red overflow tab at the right edge.
  const scale = sum > 100 ? 100 / sum : 1;
  return (
    <div className="relative h-3 rounded-full overflow-hidden flex bg-gray-800">
      {segments.map((seg, i) => (
        <div
          key={i}
          className="h-full transition-all duration-200"
          style={{
            width: `${seg.value * scale}%`,
            backgroundColor: seg.color,
            opacity: 0.85,
          }}
        />
      ))}
      {/* Red overflow stripe */}
      {sum > 100 && (
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-red-500" />
      )}
    </div>
  );
}

interface AllocationFooterProps {
  sum: number;
  valid: boolean;
  isReadOnly: boolean;
  onBalance: () => void;
  onReset: () => void;
  onSave: () => void;
  resetLabel: string;
}

function AllocationFooter({ sum, valid, isReadOnly, onBalance, onReset, onSave, resetLabel }: AllocationFooterProps) {
  const delta = parseFloat((sum - 100).toFixed(1));
  return (
    <div className="flex items-center justify-between pt-3 border-t border-white/5">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-mono tabular-nums ${valid ? 'text-gray-500' : delta > 0 ? 'text-red-400' : 'text-amber-400'}`}>
          {sum.toFixed(1)}%
          {!valid && (
            <span className="ml-1 font-sans">
              {delta > 0 ? `超出 ${delta}%` : `剩余 ${Math.abs(delta)}%`}
            </span>
          )}
        </span>
        {!valid && !isReadOnly && (
          <button
            onClick={onBalance}
            className="px-2 py-0.5 text-xs rounded-md bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            一键均衡
          </button>
        )}
      </div>
      {!isReadOnly && (
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {resetLabel}
          </button>
          <button
            onClick={onSave}
            disabled={!valid}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              valid
                ? 'bg-gold-primary/20 text-gold-primary hover:bg-gold-primary/30'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            保存
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Income allocation section (25-15-50-10)
// ---------------------------------------------------------------------------
const INCOME_KEYS: (keyof Allocation)[] = ['growth', 'stability', 'essentials', 'rewards'];
const INCOME_LABELS: Record<keyof Allocation, string> = {
  growth: '增长投资', stability: '稳健储蓄', essentials: '基本开支', rewards: '享乐奖励',
};

function IncomeAllocationSection() {
  const store = useAppStore();
  const isReadOnly = store.activeMode === 'EXAMPLE';
  const [draft, setDraft] = useState<Allocation>(() => ({ ...store.getTargetAllocation() }));

  const sum = INCOME_KEYS.reduce((acc, k) => acc + draft[k], 0);
  const valid = Math.abs(sum - 100) < 0.1;

  const autoBalance = () => {
    if (sum === 0) { setDraft({ ...DEFAULT_ALLOCATION }); return; }
    const scale = 100 / sum;
    let running = 0;
    const balanced = {} as Allocation;
    INCOME_KEYS.forEach((k, i) => {
      if (i === INCOME_KEYS.length - 1) {
        balanced[k] = Math.max(0, parseFloat((100 - running).toFixed(1)));
      } else {
        balanced[k] = Math.max(0, parseFloat((draft[k] * scale).toFixed(1)));
        running += balanced[k];
      }
    });
    setDraft(balanced);
  };

  const handleReset = () => {
    const d = { ...DEFAULT_ALLOCATION };
    setDraft(d);
    store.updateSettings({ targetAllocation: d });
  };

  return (
    <div className="space-y-4">
      <SegmentedBar
        segments={INCOME_KEYS.map((k) => ({ color: ALLOCATION_COLORS[k], value: draft[k] }))}
        sum={sum}
      />

      <div className="space-y-4">
        {INCOME_KEYS.map((k) => (
          <div key={k} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ALLOCATION_COLORS[k] }} />
                <span className="text-xs text-gray-300">{INCOME_LABELS[k]}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-600">建议 {DEFAULT_ALLOCATION[k]}%</span>
                <span className="font-mono text-white w-9 text-right tabular-nums">{draft[k]}%</span>
              </div>
            </div>
            <input
              type="range"
              min={0} max={100} step={1}
              value={draft[k]}
              disabled={isReadOnly}
              onChange={(e) => setDraft((d) => ({ ...d, [k]: parseInt(e.target.value) }))}
              style={{ accentColor: ALLOCATION_COLORS[k] }}
              className="w-full cursor-pointer disabled:opacity-40"
            />
          </div>
        ))}
      </div>

      <AllocationFooter
        sum={sum}
        valid={valid}
        isReadOnly={isReadOnly}
        onBalance={autoBalance}
        onReset={handleReset}
        onSave={() => { if (valid) store.updateSettings({ targetAllocation: { ...draft } }); }}
        resetLabel="重置为 25-15-50-10"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Investment allocation section (growth / stability / special)
// ---------------------------------------------------------------------------
const INVEST_KEYS: (keyof InvestmentPoolAllocation)[] = ['growth', 'stability', 'special'];

function InvestmentAllocationSection() {
  const store = useAppStore();
  const isReadOnly = store.activeMode === 'EXAMPLE';
  const recommended = store.getRecommendedAllocation();
  const userTargets = store.getInvestmentTargets();
  const recAlloc = recommended?.investmentAllocation ?? { growth: 60, stability: 30, special: 10 };

  const [draft, setDraft] = useState<InvestmentPoolAllocation>(() => ({ ...(userTargets ?? recAlloc) }));

  const sum = INVEST_KEYS.reduce((acc, k) => acc + draft[k], 0);
  const valid = Math.abs(sum - 100) < 0.1;

  const autoBalance = () => {
    if (sum === 0) { setDraft({ ...recAlloc }); return; }
    let running = 0;
    const balanced = {} as InvestmentPoolAllocation;
    INVEST_KEYS.forEach((k, i) => {
      if (i === INVEST_KEYS.length - 1) {
        balanced[k] = Math.max(0, parseFloat((100 - running).toFixed(1)));
      } else {
        balanced[k] = Math.max(0, parseFloat((draft[k] / sum * 100).toFixed(1)));
        running += balanced[k];
      }
    });
    setDraft(balanced);
  };

  const handleReset = () => {
    setDraft({ ...recAlloc });
    store.setInvestmentTargets(null);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        {userTargets ? '自定义目标' : '基于个人画像的智能推荐'}
      </p>

      <SegmentedBar
        segments={INVEST_KEYS.map((k) => ({ color: INVESTMENT_CATEGORY_COLORS[k], value: draft[k] }))}
        sum={sum}
      />

      <div className="space-y-4">
        {INVEST_KEYS.map((k) => (
          <div key={k} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: INVESTMENT_CATEGORY_COLORS[k] }} />
                <span className="text-xs text-gray-300">{INVESTMENT_CATEGORY_NAMES[k]}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-600">建议 {recAlloc[k].toFixed(0)}%</span>
                <span className="font-mono text-white w-9 text-right tabular-nums">{draft[k]}%</span>
              </div>
            </div>
            <input
              type="range"
              min={0} max={100} step={1}
              value={draft[k]}
              disabled={isReadOnly}
              onChange={(e) => setDraft((d) => ({ ...d, [k]: parseInt(e.target.value) }))}
              style={{ accentColor: INVESTMENT_CATEGORY_COLORS[k] }}
              className="w-full cursor-pointer disabled:opacity-40"
            />
          </div>
        ))}
      </div>

      <AllocationFooter
        sum={sum}
        valid={valid}
        isReadOnly={isReadOnly}
        onBalance={autoBalance}
        onReset={handleReset}
        onSave={() => { if (valid) store.setInvestmentTargets({ ...draft }); }}
        resetLabel="重置为建议值"
      />
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
    resetAll,
    sandboxData,
    isAuthenticated,
    setAuthenticated,
  } = useAppStore();

  // Example picker state
  const [selectedExampleId, setSelectedExampleId] = useState<string>(
    activeExampleId ?? EXAMPLE_PROFILE_METADATA[0].id
  );
  const [exampleDropdownOpen, setExampleDropdownOpen] = useState(false);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
        if (typeof json === 'object' && json !== null) {
          createSandbox(json);
        } else {
          alert('Invalid JSON file');
        }
      } catch (err) {
        console.error('Failed to parse JSON', err);
        alert('Failed to parse JSON file');
      }
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

                  {sandboxData && (
                    <button
                      onClick={handleDownloadSandbox}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 text-gray-300 hover:bg-white/10 transition-colors"
                      title="导出沙盒数据"
                    >
                      <Download size={14} /> 导出
                    </button>
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
        {/* Section 2: Profile Info                                            */}
        {/* ------------------------------------------------------------------ */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <SectionHeader
              icon={<User size={20} />}
              title="个人信息"
              subtitle="您的基础画像，用于智能推荐"
            />
            <ProfileInfoSection />
          </Card>
        </motion.div>

        {/* ------------------------------------------------------------------ */}
        {/* Section 3: Income Allocation                                       */}
        {/* ------------------------------------------------------------------ */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <SectionHeader
              icon={<PieChart size={20} />}
              title="收入分配"
              subtitle="规划月收入用途比例（25-15-50-10 法则）"
            />
            <IncomeAllocationSection />
          </Card>
        </motion.div>

        {/* ------------------------------------------------------------------ */}
        {/* Section 4: Investment Allocation                                   */}
        {/* ------------------------------------------------------------------ */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Card>
            <SectionHeader
              icon={<BarChart2 size={20} />}
              title="财产分配"
              subtitle="投资池中各类资产的目标占比"
            />
            <InvestmentAllocationSection />
          </Card>
        </motion.div>

        {/* ------------------------------------------------------------------ */}
        {/* Section 5: Data Management                                         */}
        {/* ------------------------------------------------------------------ */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
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
        {/* Section 6: Account / Logout                                       */}
        {/* ------------------------------------------------------------------ */}
        {isAuthenticated && (
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
            <Card>
              <SectionHeader
                icon={<LogOut size={20} />}
                title="账户"
                subtitle="登录状态管理"
              />
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  resetAll();
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
