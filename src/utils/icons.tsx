import {
  TrendingUp,
  Shield,
  ShieldAlert,
  Home,
  Gift,
  Target,
  type LucideIcon,
} from 'lucide-react';
import type { InvestmentCategoryType } from '../types';

export const CATEGORY_ICON_COMPONENTS: Record<InvestmentCategoryType | 'essentials' | 'rewards', LucideIcon> = {
  growth: TrendingUp,
  stability: Shield,
  special: Target,
  emergency: ShieldAlert,
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
}: IconProps & { type: InvestmentCategoryType | 'essentials' | 'rewards' }) {
  const Icon = CATEGORY_ICON_COMPONENTS[type];
  return <Icon className={className} size={size} strokeWidth={strokeWidth} style={style} />;
}
