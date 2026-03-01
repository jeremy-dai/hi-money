import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Check, X, FileText, List, BookOpen, Settings2 } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { InfoTooltip } from '../components/common/InfoTooltip';
import { TOOLTIP } from '../utils/tooltipContent';
import { useAppStore } from '../store/useAppStore';
import { formatCNY } from '../lib/format';
import { getMonthlySpendingChartData } from '../algorithms/spendingAnalytics';
import { SpendingBarChart } from '../components/charts/SpendingBarChart';
import { AllocationBreakdown } from '../components/charts/AllocationBreakdown';
import type { SpendingRecord } from '../types';

const previousMonth = (): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const formatMonthLabel = (month: string): string => {
  const [y, m] = month.split('-');
  return `${y}年${parseInt(m)}月`;
};

export default function SpendingPage() {
  const navigate = useNavigate();
  const { getCurrentData, getTargetAllocation, getMA3Spending, addSpending, addSpendingBatch, updateSpending, deleteSpending, activeMode } =
    useAppStore();
  const { spending, monthlyIncome } = getCurrentData();
  const targetAllocation = getTargetAllocation();
  const ma3 = getMA3Spending();
  const isReadOnly = activeMode === 'EXAMPLE';

  const [showAdd, setShowAdd] = useState(false);
  const [editMonth, setEditMonth] = useState<string | null>(null);
  const [form, setForm] = useState<SpendingRecord>({ month: previousMonth(), amount: 0, note: '' });

  // Batch mode state
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [parsedBatch, setParsedBatch] = useState<SpendingRecord[]>([]);

  const [showFramework, setShowFramework] = useState(false);
  const frameworkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (frameworkRef.current && !frameworkRef.current.contains(e.target as Node)) {
        setShowFramework(false);
      }
    };
    if (showFramework) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFramework]);

  const sorted = [...spending].sort((a, b) => b.month.localeCompare(a.month));
  const chartData = getMonthlySpendingChartData(spending);
  const targetMonthlySpending = monthlyIncome * (targetAllocation.essentials + targetAllocation.rewards) / 100;

  const handleSave = () => {
    if (!form.month || form.amount <= 0) return;
    addSpending(form);
    setShowAdd(false);
    setForm({ month: previousMonth(), amount: 0, note: '' });
  };

  const handleBatchParse = (text: string) => {
    setBatchText(text);
    const lines = text.split('\n').filter(line => line.trim());
    const records: SpendingRecord[] = [];

    lines.forEach(line => {
      // Split by tab, comma, or multiple spaces
      const parts = line.split(/[\t,]+|\s{2,}/).map(p => p.trim()).filter(p => p);
      if (parts.length >= 2) {
        let month = parts[0];

        // Normalize separators
        month = month.replace(new RegExp('[年/.]', 'g'), '-').replace(/月/g, '');

        // Handle YYYYMM format
        if (/^\d{6}$/.test(month)) {
            month = `${month.substring(0, 4)}-${month.substring(4, 6)}`;
        }

        // Parse and validate date
        const dateParts = month.split('-');
        if (dateParts.length >= 2) {
            const y = parseInt(dateParts[0]);
            const m = parseInt(dateParts[1]);

            if (y > 0 && m > 0 && m <= 12) {
                 month = `${y}-${String(m).padStart(2, '0')}`;

                 const amountStr = parts[1].replace(/[,¥]/g, '');
                 const amount = parseFloat(amountStr);
                 const note = parts.slice(2).join(' ') || '';

                 if (!isNaN(amount)) {
                    records.push({ month, amount, note });
                 }
            }
        }
      }
    });

    // Sort parsed records by month desc
    records.sort((a, b) => b.month.localeCompare(a.month));
    setParsedBatch(records);
  };

  const handleBatchSave = () => {
    if (parsedBatch.length === 0) return;
    addSpendingBatch(parsedBatch);
    setShowAdd(false);
    setBatchText('');
    setParsedBatch([]);
    setIsBatchMode(false);
  };

  const handleEdit = (record: SpendingRecord) => {
    setEditMonth(record.month);
    setForm({ ...record });
  };

  const handleUpdate = () => {
    if (!editMonth) return;
    updateSpending(editMonth, { amount: form.amount, note: form.note });
    setEditMonth(null);
  };

  const lastMonth = sorted[0];
  const spendingRate = monthlyIncome > 0 && lastMonth ? (lastMonth.amount / monthlyIncome) * 100 : null;

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto pb-20 pt-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">支出记录</h1>
            <p className="text-gray-400 text-sm mt-1">按月追踪支出，MA-3 移动平均帮你识别消费趋势</p>
          </div>
          <div className="flex items-center gap-2">
            {/* 收入配置法则 popover */}
            <div className="relative" ref={frameworkRef}>
              <button
                onClick={() => setShowFramework(!showFramework)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-gray-200 text-sm transition-all"
              >
                <BookOpen size={14} />
                收入配置法则
              </button>
              <AnimatePresence>
                {showFramework && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4 space-y-3"
                  >
                    <p className="text-xs font-semibold text-white">收入配置法则 25-15-50-10</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      将月收入按以下比例分配，帮助您在资产增长、生活保障与生活品质之间取得平衡。
                    </p>
                    <AllocationBreakdown allocation={targetAllocation} monthlyIncome={monthlyIncome} />
                    {!isReadOnly && (
                      <button
                        onClick={() => { setShowFramework(false); navigate('/settings#income-allocation'); }}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        <Settings2 size={12} />
                        在设置中调整配置比例
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isReadOnly && (
              <button
                onClick={() => setShowAdd((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                录入支出
              </button>
            )}
          </div>
        </div>

        {/* Add form — above stats so entering data and seeing KPIs are visually connected */}
        <AnimatePresence>
          {showAdd && !isReadOnly && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
              <Card className="border-indigo-600/40">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-white">{isBatchMode ? '批量录入支出' : '录入月度支出'}</h3>
                  <button
                    onClick={() => setIsBatchMode(!isBatchMode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300 text-xs font-medium transition-colors"
                  >
                    {isBatchMode ? <><List size={14} /> 切换单条录入</> : <><FileText size={14} /> 切换批量录入</>}
                  </button>
                </div>

                {isBatchMode ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-xs text-blue-200">
                        支持直接从 Excel 或文本粘贴。每行一条记录，格式：<br />
                        <code className="bg-black/30 px-1 py-0.5 rounded text-blue-100">月份 支出金额 备注(可选)</code><br />
                        分隔符支持空格、制表符(Tab)或逗号。月份格式支持：2024-01, 2024/01, 202401, 2024年01月
                      </p>
                    </div>
                    <textarea
                      value={batchText}
                      onChange={(e) => handleBatchParse(e.target.value)}
                      placeholder={`2024-01 5000 新年\n2024年02月 3500\n202403 4200 聚餐`}
                      className="w-full h-32 bg-black-soft border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                    />
                    {parsedBatch.length > 0 && (
                      <div className="bg-black-soft rounded-lg overflow-hidden border border-white/10">
                        <div className="px-3 py-2 bg-white/5 border-b border-white/10 flex text-xs text-gray-400 font-medium">
                          <div className="w-24">月份</div>
                          <div className="w-24">金额</div>
                          <div className="flex-1">备注</div>
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          {parsedBatch.map((record, i) => (
                            <div key={i} className="px-3 py-2 flex text-sm text-gray-300 border-b border-white/5 last:border-0">
                              <div className="w-24 font-mono">{record.month}</div>
                              <div className="w-24 font-mono">{record.amount}</div>
                              <div className="flex-1 truncate">{record.note}</div>
                            </div>
                          ))}
                        </div>
                        <div className="px-3 py-2 bg-white/5 border-t border-white/10 text-xs text-gray-400 text-right">
                          共解析 {parsedBatch.length} 条记录
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleBatchSave}
                        disabled={parsedBatch.length === 0}
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
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 block mb-1">月份</label>
                      <input
                        type="month"
                        value={form.month}
                        onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
                        className="w-full bg-black-soft border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 block mb-1">总支出 (元)</label>
                      <input
                        type="number"
                        value={form.amount || ''}
                        onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                        placeholder="10000"
                        className="w-full bg-black-soft border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 block mb-1">备注 (选填)</label>
                      <input
                        type="text"
                        value={form.note || ''}
                        onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                        placeholder="例：年假旅行"
                        className="w-full bg-black-soft border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={handleSave}
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
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: 'MA-3 月均支出',
              value: ma3 > 0 ? formatCNY(ma3) : '—',
              sub: '近3个月平均',
              color: 'text-white',
              tooltip: TOOLTIP.ma3Spending,
            },
            {
              label: '目标月支出',
              value: monthlyIncome > 0 ? formatCNY(targetMonthlySpending) : '—',
              sub: '基本开支 + 享乐奖励',
              color: 'text-amber-400',
              tooltip: null,
            },
            {
              label: '上月支出率',
              value: spendingRate !== null ? `${spendingRate.toFixed(1)}%` : '—',
              sub: spendingRate === null ? '暂无数据' : spendingRate > 55 ? '偏高' : '正常',
              color: spendingRate !== null && spendingRate > 55 ? 'text-red-400' : 'text-emerald-400',
              tooltip: TOOLTIP.spendingRate,
            },
          ].map((stat) => (
            <Card key={stat.label} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <p className="text-xs text-gray-400">{stat.label}</p>
                {stat.tooltip && <InfoTooltip content={stat.tooltip} position="bottom" />}
              </div>
              <p className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
            </Card>
          ))}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <h2 className="text-base font-semibold text-white mb-4">支出趋势</h2>
              <SpendingBarChart data={chartData} targetMonthly={targetMonthlySpending} />
            </Card>
          </motion.div>
        )}

        {/* Spending table */}
        <Card>
          <div className="flex items-center gap-1.5 mb-3">
            <h2 className="text-base font-semibold text-white">历史记录</h2>
            <InfoTooltip content={TOOLTIP.historySpendingRate} position="bottom" />
          </div>
          {sorted.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">暂无支出记录</p>
              <p className="text-xs mt-1">点击「录入支出」开始追踪</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {sorted.map((record) => {
                const isEditing = editMonth === record.month;
                const pct = monthlyIncome > 0 ? (record.amount / monthlyIncome) * 100 : 0;
                return (
                  <div key={record.month} className="group flex items-center gap-2 py-1.5 hover:bg-white/[0.03] rounded px-1 -mx-1 transition-colors">
                    {isEditing ? (
                      <>
                        <span className="text-xs text-gray-500 w-20 shrink-0">{formatMonthLabel(record.month)}</span>
                        <input
                          type="number"
                          value={form.amount || ''}
                          onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                          className="w-28 bg-black-elevated border border-indigo-500/50 rounded px-2 py-0.5 text-white text-sm"
                        />
                        <input
                          type="text"
                          value={form.note || ''}
                          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                          placeholder="备注"
                          className="flex-1 bg-black-elevated border border-white/10 rounded px-2 py-0.5 text-white text-sm"
                        />
                        <button onClick={handleUpdate} className="text-emerald-400 hover:text-emerald-300 p-1">
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => { setEditMonth(null); setForm({ month: previousMonth(), amount: 0, note: '' }); }}
                          className="text-gray-500 hover:text-gray-300 p-1"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-gray-400 w-20 shrink-0">{formatMonthLabel(record.month)}</span>
                        <span className="text-sm font-mono font-semibold text-white tabular-nums">{formatCNY(record.amount)}</span>
                        {pct > 0 && (
                          <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${pct > 55 ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                            {pct.toFixed(0)}%
                          </span>
                        )}
                        {record.note && (
                          <span className="text-xs text-gray-500 truncate flex-1">{record.note}</span>
                        )}
                        {!isReadOnly && (
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0">
                            <button onClick={() => handleEdit(record)} className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/5 transition-colors">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => deleteSpending(record.month)} className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
