import { useState } from 'react';
import { AlertTriangle, Check, Copy, FileJson } from 'lucide-react';
import type { InsurancePolicy } from '../../types/insurance.types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  onSave: (policies: InsurancePolicy[]) => void;
}

const EXAMPLE_JSON = `[
  {
    "name": "平安福终身寿险",
    "category": "protection",
    "subCategory": "termLife",
    "annualPremium": 8000,
    "cashValue": 15000,
    "coverageAmount": 500000,
    "startDate": "2023-01-15",
    "benefits": { "身故保障": "50万" }
  }
]`;

const FIELD_DOCS = [
  { field: 'name', type: 'string', required: true, desc: '保单名称' },
  { field: 'category', type: 'string', required: false, desc: 'protection | savings | investment' },
  { field: 'subCategory', type: 'string', required: false, desc: '如 criticalIllness, medical, termLife 等' },
  { field: 'isTaxAdvantaged', type: 'boolean', required: false, desc: '是否税优' },
  { field: 'annualPremium', type: 'number', required: true, desc: '年度保费' },
  { field: 'cashValue', type: 'number', required: true, desc: '当前现金价值' },
  { field: 'coverageAmount', type: 'number', required: true, desc: '保障总额' },
  { field: 'startDate', type: 'string', required: false, desc: '起始日期 YYYY-MM-DD' },
  { field: 'endDate', type: 'string', required: false, desc: '到期日期 YYYY-MM-DD' },
  { field: 'cashValueSchedule', type: 'array', required: false, desc: '[{year, amount}]' },
  { field: 'premiumSchedule', type: 'array', required: false, desc: '[{year, amount}]' },
  { field: 'coverageSchedule', type: 'array', required: false, desc: '[{year, amount}]' },
  { field: 'benefits', type: 'object', required: false, desc: '保障权益 {key: value}' },
  { field: 'notes', type: 'string', required: false, desc: '备注' },
];

export function JsonPolicyImport({ onSave }: Props) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<InsurancePolicy[] | null>(null);
  const [showDocs, setShowDocs] = useState(false);

  function handleParse() {
    setError(null);
    setPreview(null);

    const trimmed = jsonText.trim();
    if (!trimmed) {
      setError('请输入 JSON 数据');
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch (e) {
      setError(`JSON 解析失败: ${(e as Error).message}`);
      return;
    }

    // Normalize to array
    const items = Array.isArray(parsed) ? parsed : [parsed];

    if (items.length === 0) {
      setError('JSON 数组为空');
      return;
    }

    // Validate and build policies
    const policies: InsurancePolicy[] = [];
    const errors: string[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const label = items.length > 1 ? `第 ${i + 1} 条: ` : '';

      if (typeof item !== 'object' || item === null) {
        errors.push(`${label}不是有效的对象`);
        continue;
      }

      const obj = item as Record<string, unknown>;

      // Required fields
      if (!obj.name || typeof obj.name !== 'string') {
        errors.push(`${label}缺少 name (保单名称)`);
        continue;
      }

      const policy: InsurancePolicy = {
        id: uuidv4(),
        name: String(obj.name),
        category: typeof obj.category === 'string' ? obj.category as InsurancePolicy['category'] : undefined,
        subCategory: typeof obj.subCategory === 'string' ? obj.subCategory as InsurancePolicy['subCategory'] : undefined,
        isTaxAdvantaged: typeof obj.isTaxAdvantaged === 'boolean' ? obj.isTaxAdvantaged : undefined,
        annualPremium: Number(obj.annualPremium) || 0,
        cashValue: Number(obj.cashValue) || 0,
        coverageAmount: Number(obj.coverageAmount) || 0,
        startDate: typeof obj.startDate === 'string' ? obj.startDate : new Date().toISOString().slice(0, 10),
        endDate: typeof obj.endDate === 'string' ? obj.endDate : undefined,
        cashValueSchedule: Array.isArray(obj.cashValueSchedule) ? obj.cashValueSchedule as InsurancePolicy['cashValueSchedule'] : undefined,
        premiumSchedule: Array.isArray(obj.premiumSchedule) ? obj.premiumSchedule as InsurancePolicy['premiumSchedule'] : undefined,
        coverageSchedule: Array.isArray(obj.coverageSchedule) ? obj.coverageSchedule as InsurancePolicy['coverageSchedule'] : undefined,
        benefits: (typeof obj.benefits === 'object' && obj.benefits !== null && !Array.isArray(obj.benefits))
          ? obj.benefits as Record<string, string>
          : {},
        notes: typeof obj.notes === 'string' ? obj.notes : undefined,
      };

      policies.push(policy);
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    setPreview(policies);
  }

  function handleConfirm() {
    if (preview) {
      onSave(preview);
    }
  }

  function handleLoadExample() {
    setJsonText(EXAMPLE_JSON);
    setError(null);
    setPreview(null);
  }

  return (
    <div className="space-y-4">
      {/* Header hint */}
      <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
        <p className="text-xs text-violet-200">
          直接粘贴 JSON 数据导入保单。支持单个对象或数组格式。
        </p>
      </div>

      {/* Docs toggle */}
      <button
        onClick={() => setShowDocs(!showDocs)}
        className="text-xs text-gray-400 hover:text-gray-200 transition-colors underline underline-offset-2"
      >
        {showDocs ? '收起字段说明' : '查看字段说明'}
      </button>

      {showDocs && (
        <div className="bg-black-soft border border-white/10 rounded-lg overflow-hidden text-xs">
          <div className="px-3 py-2 bg-white/5 border-b border-white/10 flex text-gray-400 font-medium">
            <div className="w-40">字段</div>
            <div className="w-20">类型</div>
            <div className="w-12">必填</div>
            <div className="flex-1">说明</div>
          </div>
          {FIELD_DOCS.map((f) => (
            <div key={f.field} className="px-3 py-1.5 border-b border-white/5 flex text-gray-300">
              <div className="w-40 font-mono text-violet-300">{f.field}</div>
              <div className="w-20 text-gray-500">{f.type}</div>
              <div className="w-12">{f.required ? '✓' : ''}</div>
              <div className="flex-1 text-gray-400">{f.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setError(null);
            setPreview(null);
          }}
          placeholder='粘贴 JSON 数据...'
          className="w-full h-48 bg-black-soft border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-violet-500 resize-y"
        />
        <button
          onClick={handleLoadExample}
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <Copy size={10} /> 加载示例
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-2 items-start">
          <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
          <pre className="text-xs text-red-300 whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {/* Parse button */}
      {!preview && (
        <button
          onClick={handleParse}
          disabled={!jsonText.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
        >
          <FileJson size={16} /> 解析 JSON
        </button>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-3">
          <div className="bg-black-soft rounded-lg overflow-hidden border border-white/10">
            <div className="px-3 py-2 bg-white/5 border-b border-white/10 flex text-xs text-gray-400 font-medium">
              <div className="flex-1">保单名称</div>
              <div className="w-24 text-right">年保费</div>
              <div className="w-24 text-right">现金价值</div>
              <div className="w-24 text-right">保障额度</div>
            </div>
            {preview.map((p) => (
              <div key={p.id} className="px-3 py-2 border-b border-white/5 flex text-sm text-gray-200 items-center">
                <div className="flex-1 truncate">{p.name}</div>
                <div className="w-24 text-right font-mono text-xs">{p.annualPremium.toLocaleString()}</div>
                <div className="w-24 text-right font-mono text-xs">{p.cashValue.toLocaleString()}</div>
                <div className="w-24 text-right font-mono text-xs">{p.coverageAmount.toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Check size={16} /> 确认导入 {preview.length} 条保单
            </button>
            <button
              onClick={() => setPreview(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              返回修改
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
