import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Check, X, FileText, List, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { useAppStore } from '../store/useAppStore';
import { formatCNY } from '../lib/format';
import { getMonthlySpendingChartData } from '../algorithms/spendingAnalytics';
import { SpendingBarChart } from '../components/charts/SpendingBarChart';
import { AllocationDonut } from '../components/charts/AllocationDonut';
import { DEFAULT_ALLOCATION } from '../utils/constants';
import type { SpendingRecord } from '../types';

const currentMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const formatMonthLabel = (month: string): string => {
  const [y, m] = month.split('-');
  return `${y}年${parseInt(m)}月`;
};

export default function SpendingPage() {
  const { getCurrentData, getMA3Spending, addSpending, addSpendingBatch, updateSpending, deleteSpending, activeMode } =
    useAppStore();
  const { spending, monthlyIncome } = getCurrentData();
  const ma3 = getMA3Spending();
  const isReadOnly = activeMode === 'EXAMPLE';

  const [showAdd, setShowAdd] = useState(false);
  const [editMonth, setEditMonth] = useState<string | null>(null);
  const [form, setForm] = useState<SpendingRecord>({ month: currentMonth(), amount: 0, note: '' });

  // Batch mode state
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [parsedBatch, setParsedBatch] = useState<SpendingRecord[]>([]);

  const [showFramework, setShowFramework] = useState(false);
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const sorted = [...spending].sort((a, b) => b.month.localeCompare(a.month));
  const chartData = getMonthlySpendingChartData(spending);
  const targetMonthlySpending = monthlyIncome * 0.5; // 50% of income

  const handleSave = () => {
    if (!form.month || form.amount <= 0) return;
    addSpending(form);
    setShowAdd(false);
    setForm({ month: currentMonth(), amount: 0, note: '' });
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
          {!isReadOnly && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              录入支出
            </button>
          )}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: 'MA-3 月均支出',
              value: ma3 > 0 ? formatCNY(ma3) : '—',
              sub: '近3个月平均',
              color: 'text-white',
            },
            {
              label: '目标月支出',
              value: monthlyIncome > 0 ? formatCNY(targetMonthlySpending) : '—',
              sub: '收入的 50%',
              color: 'text-amber-400',
            },
            {
              label: '上月支出率',
              value: spendingRate !== null ? `${spendingRate.toFixed(1)}%` : '—',
              sub: spendingRate !== null && spendingRate > 55 ? '偏高' : '正常',
              color: spendingRate !== null && spendingRate > 55 ? 'text-red-400' : 'text-emerald-400',
            },
          ].map((stat) => (
            <Card key={stat.label} className="text-center">
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
            </Card>
          ))}
        </div>

        {/* 25-15-50-10 Educational Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <button
              onClick={() => setShowFramework(!showFramework)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-400" />
                <span className="text-sm font-semibold text-white">收入配置法则 25-15-50-10</span>
              </div>
              {showFramework ? (
                <ChevronUp size={16} className="text-gray-500" />
              ) : (
                <ChevronDown size={16} className="text-gray-500" />
              )}
            </button>

            <AnimatePresence>
              {showFramework && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-4">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      将月收入按以下比例分配，帮助您在资产增长、生活保障与生活品质之间取得平衡。
                    </p>
                    <AllocationDonut
                      allocation={DEFAULT_ALLOCATION}
                      target={DEFAULT_ALLOCATION}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: '增长投资', pct: '25%', desc: '股票、ETF、基金', color: 'text-emerald-400' },
                        { label: '稳健储蓄', pct: '15%', desc: '债券、应急金', color: 'text-blue-400' },
                        { label: '基本开支', pct: '50%', desc: '房租、餐饮、日常', color: 'text-amber-400' },
                        { label: '享乐奖励', pct: '10%', desc: '旅行、娱乐', color: 'text-pink-400' },
                      ].map((item) => (
                        <div key={item.label} className="p-2.5 rounded-lg bg-white/3">
                          <p className={`text-sm font-semibold ${item.color}`}>
                            {item.label} <span className="text-white">{item.pct}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Chart */}
        {chartData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <h2 className="text-base font-semibold text-white mb-4">支出趋势</h2>
              <SpendingBarChart data={chartData} targetMonthly={targetMonthlySpending} />
            </Card>
          </motion.div>
        )}

        {/* Add form */}
        {showAdd && !isReadOnly && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-indigo-600/40">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-white">{isBatchMode ? '批量录入支出' : '录入月度支出'}</h3>
                  <button 
                    onClick={() => setIsBatchMode(!isBatchMode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300 text-xs font-medium transition-colors"
                  >
                    {isBatchMode ? <><List size={14}/> 切换单条录入</> : <><FileText size={14}/> 切换批量录入</>}
                  </button>
              </div>

              {isBatchMode ? (
                <div className="space-y-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-blue-200">
                            支持直接从 Excel 或文本粘贴。每行一条记录，格式：<br/>
                            <code className="bg-black/30 px-1 py-0.5 rounded text-blue-100">月份 支出金额 备注(可选)</code><br/>
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
                  <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">月份</label>
                          <input
                            type="month"
                            value={form.month}
                            onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
                            className="w-full bg-black-soft border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">总支出 (元)</label>
                          <input
                            type="number"
                            value={form.amount || ''}
                            onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                            placeholder="10000"
                            className="w-full bg-black-soft border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">备注 (选填)</label>
                          <input
                            type="text"
                            value={form.note || ''}
                            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                            placeholder="例：年假旅行"
                            className="w-full bg-black-soft border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
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
                  </>
              )}
            </Card>
          </motion.div>
        )}

        {/* Spending table */}
        <Card>
          <h2 className="text-base font-semibold text-white mb-4">历史记录</h2>
          {sorted.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">暂无支出记录</p>
              <p className="text-xs mt-1">点击「录入支出」开始追踪</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((record) => {
                const isEditing = editMonth === record.month;
                const pct = monthlyIncome > 0 ? (record.amount / monthlyIncome) * 100 : 0;
                return (
                  <div
                    key={record.month}
                    className="relative group rounded-lg bg-black-soft"
                    onMouseEnter={() => setHoveredMonth(record.month)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    <AnimatePresence>
                      {hoveredMonth === record.month && (
                        <motion.span
                          className="absolute inset-0 h-full w-full bg-slate-700/[0.8] block rounded-lg"
                          layoutId="hoverBackground"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: 1,
                            transition: { duration: 0.15 },
                          }}
                          exit={{
                            opacity: 0,
                            transition: { duration: 0.15, delay: 0.2 },
                          }}
                        />
                      )}
                    </AnimatePresence>
                    <div className="relative z-10 flex items-center gap-3 p-3">
                      {isEditing ? (
                      <>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={form.amount || ''}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))
                            }
                            className="bg-black-elevated border border-indigo-500/50 rounded px-2 py-1 text-white text-sm"
                          />
                          <input
                            type="text"
                            value={form.note || ''}
                            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                            placeholder="备注"
                            className="bg-black-elevated border border-white/10 rounded px-2 py-1 text-white text-sm"
                          />
                        </div>
                        <button onClick={handleUpdate} className="text-emerald-400 hover:text-emerald-300 p-1">
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditMonth(null);
                            setForm({ month: currentMonth(), amount: 0, note: '' });
                          }}
                          className="text-gray-500 hover:text-gray-300 p-1"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-24 shrink-0">
                          <p className="text-sm font-medium text-white">{formatMonthLabel(record.month)}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-mono font-semibold text-white">
                              {formatCNY(record.amount)}
                            </span>
                            {pct > 0 && (
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                  pct > 55 ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                                }`}
                                title="支出占月收入百分比"
                              >
                                占收入 {pct.toFixed(0)}%
                              </span>
                            )}
                          </div>
                          {record.note && (
                            <p className="text-xs text-gray-500 mt-0.5">{record.note}</p>
                          )}
                        </div>
                        {!isReadOnly && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(record)}
                              className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-white/5 transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => deleteSpending(record.month)}
                              className="text-gray-400 hover:text-red-400 p-1.5 rounded hover:bg-white/5 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
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
