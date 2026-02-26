import { Info } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: string;
  className?: string;
  iconSize?: number;
  iconColor?: string;
}

export function InfoTooltip({
  content,
  position = 'top',
  width = 'w-64',
  className,
  iconSize = 14,
  iconColor = 'text-gray-500 hover:text-gray-300',
}: InfoTooltipProps) {
  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className={cn('group relative inline-flex items-center shrink-0', className)}>
      <Info size={iconSize} className={cn('cursor-help transition-colors', iconColor)} />
      <div
        className={cn(
          'absolute z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          'bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs text-gray-300 shadow-xl leading-relaxed',
          positionClasses[position],
          width
        )}
      >
        {content}
      </div>
    </div>
  );
}
