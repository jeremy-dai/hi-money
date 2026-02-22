import {
  TrendingUp,
  Shield,
  Home,
  Gift,
  Target,
  Wallet,
  Building2,
  Rocket,
  BarChart3,
  Settings,
  DollarSign,
  Lightbulb,
  Zap,
  CheckCircle,
  Car,
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

export const QUICK_ACTION_ICONS: Record<string, LucideIcon> = {
  allocate_income: Wallet,
  accounts: Building2,
  investment_guidance: Rocket,
  analytics: BarChart3,
  settings: Settings,
};

export const EDUCATION_ICONS: Record<string, LucideIcon> = {
  money: DollarSign,
  Home: Home,
  Car: Car,
  tip: Lightbulb,
  key: Zap,
  check: CheckCircle,
  TrendingUp: TrendingUp,
  Shield: Shield,
  Gift: Gift,
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

export function QuickActionIcon({
  action,
  className = '',
  size = 24,
  strokeWidth = 2,
}: IconProps & { action: string }) {
  const Icon = QUICK_ACTION_ICONS[action];
  if (!Icon) return null;
  return <Icon className={className} size={size} strokeWidth={strokeWidth} />;
}

export function EducationIcon({
  name,
  className = '',
  size = 24,
  strokeWidth = 2,
}: IconProps & { name: string }) {
  const Icon = EDUCATION_ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} size={size} strokeWidth={strokeWidth} />;
}
