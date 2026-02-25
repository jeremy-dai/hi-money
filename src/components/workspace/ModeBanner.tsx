
import React from 'react';
import { useAppStore } from '../../store/useAppStore';

export const ModeBanner: React.FC = () => {
  const { activeMode, activeExampleId, switchMode } = useAppStore();

  if (activeMode === 'PERSONAL') {
    return null;
  }

  const isSandbox = activeMode === 'SANDBOX';
  const bgColor = isSandbox ? 'bg-amber-600' : 'bg-blue-600';
  const label = isSandbox
    ? '本地模式 — 数据仅保存在此设备，不同步到云端'
    : `只读案例: ${activeExampleId}`;

  const handleExit = () => {
    switchMode('PERSONAL');
  };

  return (
    <div className={`${bgColor} text-white px-4 py-2 flex justify-between items-center shadow-md z-50 relative`}>
      <div className="flex items-center gap-2">
        <span className="font-medium">{label}</span>
      </div>
      <button 
        onClick={handleExit}
        className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors"
      >
        退出演示
      </button>
    </div>
  );
};
