import type { InvestmentCategoryType } from '../types';

// Investment Categories (asset tracking)
export const INVESTMENT_CATEGORY_COLORS: Record<InvestmentCategoryType, string> = {
  growth: '#10B981',   // emerald-500
  stability: '#3B82F6', // blue-500
  special: '#8B5CF6',  // violet-500
};

export const INVESTMENT_CATEGORY_NAMES: Record<InvestmentCategoryType, string> = {
  growth: '成长投资',
  stability: '稳健储蓄',
  special: '特殊用途',
};

export const INVESTMENT_CATEGORY_DESCRIPTIONS: Record<InvestmentCategoryType, string> = {
  growth: '股票、ETF、指数基金等高增长投资',
  stability: '债券、应急基金、定期存款',
  special: '教育基金、机会投资、其他目标',
};

// 25-15-50-10 income allocation framework
export const ALLOCATION_NAMES: Record<string, string> = {
  growth: '增长投资 (25%)',
  stability: '稳健储蓄 (15%)',
  essentials: '基本开支 (50%)',
  rewards: '享乐奖励 (10%)',
};

export const ALLOCATION_COLORS: Record<string, string> = {
  growth: '#10B981',
  stability: '#3B82F6',
  essentials: '#F59E0B',
  rewards: '#EC4899',
};

// Default allocation (25-15-50-10)
export const DEFAULT_ALLOCATION = {
  growth: 25,
  stability: 15,
  essentials: 50,
  rewards: 10,
};

// Application routes
export const ROUTES = {
  WELCOME: '/',
  LOGIN: '/login',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  SPENDING: '/spending',
  ASSETS: '/assets',
  SETTINGS: '/settings',
} as const;

// Profile constants
export const CITY_TIER_NAMES: Record<1 | 2 | 3 | 4, string> = {
  1: '一线城市',
  2: '二线城市',
  3: '三线城市',
  4: '四线城市',
};

export const MARITAL_STATUS_NAMES: Record<'single' | 'married' | 'divorced', string> = {
  single: '单身',
  married: '已婚',
  divorced: '离异',
};

export const RISK_TOLERANCE_NAMES: Record<'conservative' | 'moderate' | 'aggressive', string> = {
  conservative: '保守型',
  moderate: '稳健型',
  aggressive: '进取型',
};

export const PRIMARY_GOAL_NAMES: Record<
  'retirement' | 'house' | 'education' | 'wealth' | 'security',
  string
> = {
  retirement: '退休规划',
  house: '购房',
  education: '教育基金',
  wealth: '财富增长',
  security: '财务安全',
};

// Example Profiles Mapping (ID to UUID)
export const EXAMPLE_USER_IDS: Record<string, string> = {
  'fresh-graduate': '00000000-0000-0000-0000-000000000001',
  'mid-career-family': '00000000-0000-0000-0000-000000000002',
  'high-net-worth': '00000000-0000-0000-0000-000000000003',
};
