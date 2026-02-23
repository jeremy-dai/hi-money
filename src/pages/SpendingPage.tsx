import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { useAppStore } from '../store/useAppStore';
import { formatCNY } from '../lib/format';
import { getMonthlySpendingChartData } from '../algorithms/spendingAnalytics';
import { SpendingBarChart } from '../components/charts/SpendingBarChart';
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
  const { getCurrentData, getMA3Spending, addSpending, updateSpending, deleteSpending, activeMode } =
    useAppStore();
  const { spending, monthlyIncome } = getCurrentData();
  const ma3 = getMA3Spending();
  const isReadOnly = activeMode === 'EXAMPLE';

  const [showAdd, setShowAdd] = useState(false);
  const [editMonth, setEditMonth] = useState<string | null>(null);
  const [form, setForm] = useState<SpendingRecord>({ month: currentMonth(), amount: 0, note: '' });

  const sorted = [...spending].sort((a, b) => b.month.localeCompare(a.month));
  const chartData = getMonthlySpendingChartData(spending);
  const targetMonthlySpending = monthlyIncome * 0.5; // 50% of income

  const handleSave = () => {
    if (!form.month || form.amount <= 0) return;
    addSpending(form);
    setShowAdd(false);
    setForm({ month: currentMonth(), amount: 0, note: '' });
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
              <h3 className="text-base font-semibold text-white mb-4">录入月度支出</h3>
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
                    className="flex items-center gap-3 p-3 rounded-lg bg-black-soft group"
                  >
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
                        <button onClick={() => setEditMonth(null)} className="text-gray-500 hover:text-gray-300 p-1">
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
                              >
                                {pct.toFixed(0)}%
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
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
