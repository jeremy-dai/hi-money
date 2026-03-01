import { motion } from 'framer-motion';
import clsx from 'clsx';

interface ProgressBarProps {
  current: number;
  target: number;
  showPercentage?: boolean;
}

export function ProgressBar({
  current,
  target,
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isComplete = percentage >= 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">当前进度</span>
        {showPercentage && (
          <span className="text-lg font-bold font-mono text-gold-primary">
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Progress track */}
      <div className="w-full h-2 bg-black-soft rounded-full overflow-hidden relative">
        <motion.div
          className={clsx(
            'h-full rounded-full bg-gold-gradient',
            'shadow-gold',
            isComplete && 'animate-pulse'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Amount labels */}
      <div className="flex justify-between items-center mt-2 text-sm font-mono">
        <span className="text-gray-400">
          ¥{current.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
        </span>
        <span className="text-gray-400">
          ¥{target.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
