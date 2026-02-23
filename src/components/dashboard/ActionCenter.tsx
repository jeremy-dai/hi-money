import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import type { ActionItem } from '../../algorithms/spendingAnalytics';

interface Props {
  items: ActionItem[];
}

const PRIORITY_CONFIG = {
  high: {
    icon: <AlertCircle size={14} className="text-red-400 shrink-0" />,
    badge: 'bg-red-500/15 text-red-400',
    border: 'border-red-500/20',
  },
  medium: {
    icon: <Info size={14} className="text-amber-400 shrink-0" />,
    badge: 'bg-amber-500/15 text-amber-400',
    border: 'border-amber-500/20',
  },
  low: {
    icon: <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />,
    badge: 'bg-emerald-500/15 text-emerald-400',
    border: 'border-emerald-500/20',
  },
};

const PRIORITY_LABELS: Record<ActionItem['priority'], string> = {
  high: '优先',
  medium: '建议',
  low: '完成',
};

export function ActionCenter({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-400" />
        <p className="text-sm">一切就绪，继续保持！</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const cfg = PRIORITY_CONFIG[item.priority];
        const content = (
          <>
            {cfg.icon}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded ${cfg.badge}`}>
                  {PRIORITY_LABELS[item.priority]}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{item.description}</p>
            </div>
            {item.route && (
              <ArrowRight
                size={14}
                className="text-gray-600 group-hover:text-gray-300 transition-colors shrink-0 mt-0.5"
              />
            )}
          </>
        );

        const className = `w-full flex items-start gap-3 p-3 rounded-lg border ${cfg.border} bg-white/2 hover:bg-white/5 transition-colors text-left group`;

        if (item.route) {
          return (
            <Link key={item.id} to={item.route} className={className}>
              {content}
            </Link>
          );
        }

        return (
          <div key={item.id} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
