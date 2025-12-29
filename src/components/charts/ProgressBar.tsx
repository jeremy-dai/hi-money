import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  target: number;
  color?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  current,
  target,
  color = '#667eea',
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">当前进度</span>
        {showPercentage && (
          <span className="text-lg font-bold" style={{ color }}>
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>

      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
        <span>¥{current.toFixed(2)}</span>
        <span>¥{target.toFixed(2)}</span>
      </div>
    </div>
  );
}
