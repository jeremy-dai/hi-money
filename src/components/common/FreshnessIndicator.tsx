import React from 'react';

const getRelativeTime = (isoDate?: string): { label: string; color: string } => {
  if (!isoDate) {
    return { label: '未知', color: 'bg-gray-400' };
  }

  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours < 1) {
    return { label: '刚刚', color: 'bg-emerald-500' };
  }
  
  if (diffHours < 24) {
    return { label: `${Math.floor(diffHours)} 小时前`, color: 'bg-emerald-500' };
  }
  
  if (diffDays < 7) {
    return { label: `${Math.floor(diffDays)} 天前`, color: 'bg-emerald-500' };
  }
  
  if (diffDays < 30) {
    return { label: `${Math.floor(diffDays / 7)} 周前`, color: 'bg-amber-500' };
  }
  
  if (diffDays < 90) {
    return { label: `${Math.floor(diffDays / 30)} 个月前`, color: 'bg-orange-500' };
  }
  
  return { label: `${Math.floor(diffDays / 30)} 个月前`, color: 'bg-red-500' };
};

export const FreshnessIndicator: React.FC<{ date?: string }> = ({ date }) => {
  const { label, color } = getRelativeTime(date);

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
      <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
};
