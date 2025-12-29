import { motion } from 'framer-motion';
import type { CategoryType } from '../../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../utils/constants';

interface WealthCardProps {
  type: CategoryType;
  title: string;
  percentage: number;
  amount: number;
  subtitle: string;
  onClick?: () => void;
}

export function WealthCard({ type, title, percentage, amount, subtitle, onClick }: WealthCardProps) {
  const color = CATEGORY_COLORS[type];
  const icon = CATEGORY_ICONS[type];

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-3xl p-6 shadow-lg cursor-pointer relative overflow-hidden"
    >
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: color }} />

      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <span className="text-3xl">{icon}</span>
      </div>

      <div className="text-4xl font-bold mb-2" style={{ color }}>
        {percentage}%
      </div>

      <div className="text-2xl font-semibold text-gray-900 mb-2">¥{amount.toFixed(2)}</div>

      <p className="text-sm text-gray-600">{subtitle}</p>
    </motion.div>
  );
}
