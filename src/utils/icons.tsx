import {
  TrendingUp,
  Shield,
  Home,
  Gift,
  Target,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryType } from '../types';

export const CATEGORY_ICON_COMPONENTS: Record<CategoryType, LucideIcon> = {
  growth: TrendingUp,
  stability: Shield,
  special: Target,
  essentials: Home,
  rewards: Gift,
};

interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export function CategoryIcon({
  type,
  className = '',
  size = 24,
  strokeWidth = 2,
  style,
}: IconProps & { type: CategoryType }) {
  const Icon = CATEGORY_ICON_COMPONENTS[type];
  return <Icon className={className} size={size} strokeWidth={strokeWidth} style={style} />;
}
