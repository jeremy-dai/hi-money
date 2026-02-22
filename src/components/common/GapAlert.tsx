import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCNY } from '@/lib/format';
import React from 'react';

interface GapAlertProps {
  type: 'insurance' | 'retirement';
  gap: number;
  className?: string;
}

export function GapAlert({ type, gap, className }: GapAlertProps) {
  if (gap <= 0) return null;

  return (
    <div className={cn("bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3", className)}>
      <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
      <div>
        <h4 className="text-red-500 font-medium mb-1">
          {type === 'insurance' ? '保障缺口警告' : '退休资金缺口'}
        </h4>
        <p className="text-sm text-gray-400">
          检测到 {formatCNY(gap)} 的{type === 'insurance' ? '保障' : '资金'}缺口，建议尽快补足。
        </p>
      </div>
    </div>
  );
}
