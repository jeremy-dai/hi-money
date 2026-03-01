import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Loader2, Check, X, FileUp, FileText, Plus } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import type { InsurancePolicy, InsuranceCategory, InsuranceSubCategory } from '../../types/insurance.types';
import {
  INSURANCE_SUBCATEGORY_LABELS,
  INSURANCE_CATEGORY_MAPPING,
} from '../../utils/insuranceConstants';
import { extractPoliciesFromText } from '../../services/llmService';
import { Card } from '../common/Card';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface Props {
  isReadOnly: boolean;
  onSave: (policies: InsurancePolicy[]) => void;
  embedded?: boolean;
}

interface QueuedDocument {
  id: string;
  name: string;
  text: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
}

function deriveCategoryFromSub(sub?: string): InsuranceCategory | undefined {
  if (!sub) return undefined;
  for (const [cat, subs] of Object.entries(INSURANCE_CATEGORY_MAPPING)) {
    if ((subs as string[]).includes(sub)) return cat as InsuranceCategory;
  }
  return undefined;
}

export function BatchPolicyImport({ isReadOnly, onSave, embedded = false }: Props) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [documents, setDocuments] = useState<QueuedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedPolicies, setExtractedPolicies] = useState<Partial<InsurancePolicy>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addTextToQueue = () => {
    if (!inputText.trim()) return;
    setDocuments(prev => [
      ...prev,
      { id: `doc_${Date.now()}`, name: `文本文档 ${prev.length + 1}`, text: inputText.trim(), status: 'pending' },
    ]);
    setInputText('');
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          pages.push(content.items.map((item: { str: string }) => item.str).join(' '));
        }
        const text = pages.join('\n');
        setDocuments(prev => [
          ...prev,
          { id: `doc_${Date.now()}_${file.name}`, name: file.name, text, status: 'pending' },
        ]);
      } catch {
        setDocuments(prev => [
          ...prev,
          { id: `doc_${Date.now()}_${file.name}`, name: file.name, text: '', status: 'error', error: 'PDF 解析失败' },
        ]);
      }
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleParseAll = async () => {
    const pendingDocs = documents.filter(d => d.status === 'pending' && d.text);
    if (pendingDocs.length === 0) return;

    setLoading(true);
    setError(null);
    const allPolicies: Partial<InsurancePolicy>[] = [...extractedPolicies];

    for (const doc of pendingDocs) {
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'processing' } : d));
      try {
        const results = await extractPoliciesFromText(doc.text);
        allPolicies.push(...results);
        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'done' } : d));
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'AI 解析失败';
        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'error', error: msg } : d));
        setError(msg);
      }
    }

    setExtractedPolicies(allPolicies);
    setLoading(false);
  };

  const handleFieldEdit = (index: number, field: string, value: unknown) => {
    setExtractedPolicies(prev => prev.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    ));
  };

  const handleRemovePolicy = (index: number) => {
    setExtractedPolicies(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmSave = () => {
    const valid = extractedPolicies.filter(p => p.name);
    const complete: InsurancePolicy[] = valid.map((p, i) => ({
      id: `pol_${Date.now()}_${i}`,
      name: p.name!,
      category: deriveCategoryFromSub(p.subCategory),
      subCategory: p.subCategory as InsuranceSubCategory | undefined,
      isTaxAdvantaged: p.isTaxAdvantaged ?? false,
      annualPremium: p.annualPremium ?? 0,
      cashValue: p.cashValue ?? 0,
      coverageAmount: p.coverageAmount ?? 0,
      startDate: p.startDate ?? '',
      endDate: p.endDate,
      cashValueSchedule: p.cashValueSchedule,
      premiumSchedule: p.premiumSchedule,
      coverageSchedule: p.coverageSchedule,
      notes: p.notes,
      benefits: p.benefits ?? {},
    }));
    onSave(complete);
    // Reset
    setOpen(false);
    setInputText('');
    setDocuments([]);
    setExtractedPolicies([]);
    setError(null);
  };

  const pendingCount = documents.filter(d => d.status === 'pending' && d.text).length;
  const doneCount = documents.filter(d => d.status === 'done').length;

  if (isReadOnly) return null;

  const content = (
              <div className="space-y-4">
                {/* Instructions */}
                <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                  <p className="text-xs text-violet-200 leading-relaxed">
                    粘贴保险合同文本或上传 PDF，AI 将自动识别险种、保费、保额、保障责任等信息。
                    支持同时导入多份文档，逐一解析后汇总预览。
                  </p>
                </div>

                {/* Input area */}
                <div className="space-y-3">
                  {/* Textarea */}
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="在此粘贴保险单证文本..."
                    className="w-full h-28 bg-black-soft border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addTextToQueue}
                      disabled={!inputText.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Plus size={12} /> 添加到队列
                    </button>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-medium transition-colors cursor-pointer">
                      <FileUp size={12} /> 上传 PDF
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={handlePdfUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Document queue */}
                {documents.length > 0 && (
                  <div className="bg-black-soft rounded-lg border border-white/10 overflow-hidden">
                    <div className="px-3 py-2 bg-white/5 border-b border-white/10 flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-medium">文档队列</span>
                      <span className="text-xs text-gray-500">{doneCount}/{documents.length} 已完成</span>
                    </div>
                    <div className="max-h-32 overflow-y-auto">
                      {documents.map(doc => (
                        <div key={doc.id} className="px-3 py-2 flex items-center justify-between border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText size={12} className="text-gray-500 shrink-0" />
                            <span className="text-xs text-gray-300 truncate">{doc.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {doc.status === 'pending' && <span className="text-xs text-gray-500">待处理</span>}
                            {doc.status === 'processing' && <Loader2 size={12} className="text-violet-400 animate-spin" />}
                            {doc.status === 'done' && <Check size={12} className="text-emerald-400" />}
                            {doc.status === 'error' && (
                              <span className="text-xs text-red-400" title={doc.error}>失败</span>
                            )}
                            {doc.status !== 'processing' && (
                              <button onClick={() => removeDocument(doc.id)} className="text-gray-600 hover:text-red-400">
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parse button */}
                {pendingCount > 0 && (
                  <button
                    onClick={handleParseAll}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {loading ? (
                      <><Loader2 size={14} className="animate-spin" /> AI 解析中...</>
                    ) : (
                      <><Sparkles size={14} /> 开始解析 ({pendingCount} 篇)</>
                    )}
                  </button>
                )}

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">
                    {error}
                  </div>
                )}

                {/* Preview table */}
                {extractedPolicies.length > 0 && (
                  <div className="bg-black-soft rounded-lg overflow-hidden border border-white/10">
                    <div className="px-3 py-2 bg-white/5 border-b border-white/10">
                      <span className="text-xs text-gray-400 font-medium">解析结果预览</span>
                    </div>
                    {/* Header */}
                    <div className="px-3 py-2 bg-white/[0.02] border-b border-white/10 grid grid-cols-[1fr_120px_90px_90px_90px_24px] text-xs text-gray-500 font-medium gap-2">
                      <div>保单名称</div>
                      <div>险种</div>
                      <div className="text-right">年保费</div>
                      <div className="text-right">现金价值</div>
                      <div className="text-right">保障额度</div>
                      <div></div>
                    </div>
                    {/* Rows */}
                    <div className="max-h-60 overflow-y-auto">
                      {extractedPolicies.map((policy, i) => (
                        <div key={i} className="px-3 py-2 grid grid-cols-[1fr_120px_90px_90px_90px_24px] text-sm text-gray-300 border-b border-white/5 last:border-0 gap-2 items-center">
                          <input
                            value={policy.name ?? ''}
                            onChange={(e) => handleFieldEdit(i, 'name', e.target.value)}
                            className="bg-transparent border-b border-white/10 focus:border-violet-500 focus:outline-none text-sm text-white w-full"
                          />
                          <select
                            value={policy.subCategory ?? ''}
                            onChange={(e) => handleFieldEdit(i, 'subCategory', e.target.value || undefined)}
                            className="bg-black-elevated border border-white/10 rounded px-1 py-0.5 text-xs text-gray-300 focus:outline-none focus:border-violet-500"
                          >
                            <option value="">未分类</option>
                            {Object.entries(INSURANCE_SUBCATEGORY_LABELS).map(([code, label]) => (
                              <option key={code} value={code}>{label}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={policy.annualPremium ?? 0}
                            onChange={(e) => handleFieldEdit(i, 'annualPremium', Number(e.target.value))}
                            className="bg-transparent border-b border-white/10 focus:border-violet-500 focus:outline-none text-right font-mono text-sm text-white w-full"
                          />
                          <input
                            type="number"
                            value={policy.cashValue ?? 0}
                            onChange={(e) => handleFieldEdit(i, 'cashValue', Number(e.target.value))}
                            className="bg-transparent border-b border-white/10 focus:border-violet-500 focus:outline-none text-right font-mono text-sm text-white w-full"
                          />
                          <input
                            type="number"
                            value={policy.coverageAmount ?? 0}
                            onChange={(e) => handleFieldEdit(i, 'coverageAmount', Number(e.target.value))}
                            className="bg-transparent border-b border-white/10 focus:border-violet-500 focus:outline-none text-right font-mono text-sm text-white w-full"
                          />
                          <button onClick={() => handleRemovePolicy(i)} className="text-gray-600 hover:text-red-400">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Details section per policy */}
                    {extractedPolicies.some(p => p.benefits && Object.keys(p.benefits).length > 0 || p.notes) && (
                      <div className="border-t border-white/10 px-3 py-2 space-y-2">
                        <span className="text-xs text-gray-500 font-medium">提取的详细信息</span>
                        {extractedPolicies.map((policy, i) => {
                          const hasBenefits = policy.benefits && Object.keys(policy.benefits).length > 0;
                          const hasSchedules = (policy.cashValueSchedule?.length ?? 0) > 0
                            || (policy.premiumSchedule?.length ?? 0) > 0
                            || (policy.coverageSchedule?.length ?? 0) > 0;
                          if (!hasBenefits && !policy.notes && !hasSchedules) return null;
                          return (
                            <div key={i} className="bg-white/[0.02] rounded-lg p-2 space-y-1">
                              <span className="text-xs text-violet-300 font-medium">{policy.name}</span>
                              {hasBenefits && (
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(policy.benefits!).map(([k, v]) => (
                                    <span key={k} className="text-xs bg-violet-500/10 text-violet-200 px-1.5 py-0.5 rounded">
                                      {k}: {v}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {policy.notes && (
                                <p className="text-xs text-gray-500">{policy.notes}</p>
                              )}
                              {hasSchedules && (
                                <span className="text-xs text-gray-500">
                                  含年度计划表 ({[
                                    policy.cashValueSchedule?.length ? '现金价值' : '',
                                    policy.premiumSchedule?.length ? '保费' : '',
                                    policy.coverageSchedule?.length ? '保额' : '',
                                  ].filter(Boolean).join('、')})
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* Footer */}
                    <div className="px-3 py-2 bg-white/5 border-t border-white/10 text-xs text-gray-400 text-right">
                      共解析 {extractedPolicies.length} 份保单
                      {doneCount > 0 && `（来自 ${doneCount} 篇文档）`}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {extractedPolicies.length > 0 && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleConfirmSave}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Check size={15} /> 确认导入 ({extractedPolicies.length} 份)
                    </button>
                    <button
                      onClick={() => { setExtractedPolicies([]); setDocuments([]); setError(null); }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors"
                    >
                      <X size={15} /> 清空
                    </button>
                  </div>
                )}
              </div>
  );

  if (embedded) return content;

  return (
    <>
      {/* Toggle button */}
      <div className="flex justify-end">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            open
              ? 'bg-violet-600 text-white'
              : 'bg-white/5 hover:bg-white/10 text-violet-300'
          }`}
        >
          <Bot size={14} /> AI批量导入
        </button>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <Card className="border-violet-600/40">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-violet-400" />
                  <h3 className="text-base font-semibold text-white">AI 批量解析保单</h3>
                </div>
                <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-300 p-1">
                  <X size={16} />
                </button>
              </div>
              {content}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
