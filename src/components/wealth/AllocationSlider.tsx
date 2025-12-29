import { motion } from 'framer-motion';
import type { CategoryType } from '../../types';
import { CATEGORY_COLORS } from '../../utils/constants';

interface AllocationSliderProps {
  category: CategoryType;
  label: string;
  value: number;
  description: string;
  onChange: (value: number) => void;
  isChanging?: boolean;
}

export function AllocationSlider({
  category,
  label,
  value,
  description,
  onChange,
  isChanging = false,
}: AllocationSliderProps) {
  const color = CATEGORY_COLORS[category];

  return (
    <motion.div
      className="space-y-2"
      animate={{ scale: isChanging ? 1.02 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-800">{label}</span>
        <span className="text-2xl font-bold" style={{ color }}>
          {value}%
        </span>
      </div>

      <p className="text-sm text-gray-600">{description}</p>

      <div className="relative pt-1">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #E5E7EB ${value}%, #E5E7EB 100%)`,
          }}
        />
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${color};
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${color};
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </motion.div>
  );
}
