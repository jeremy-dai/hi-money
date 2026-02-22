import type { CategoryType, InvestmentCategoryType, EducationCategoryType } from '../types';

// Investment Categories (Dashboard - Portfolio Tracking)
export const INVESTMENT_CATEGORY_COLORS: Record<InvestmentCategoryType, string> = {
  growth: '#10B981', // emerald-500
  stability: '#3B82F6', // blue-500
  special: '#8B5CF6', // violet-500
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

// Education Categories (Welcome/Detail Pages - Income Allocation Teaching)
export const EDUCATION_CATEGORY_COLORS: Record<EducationCategoryType, string> = {
  growth: '#10B981',
  stability: '#3B82F6',
  essentials: '#F59E0B',
  rewards: '#EC4899',
};

export const EDUCATION_CATEGORY_NAMES: Record<EducationCategoryType, string> = {
  growth: '增长投资',
  stability: '稳健储蓄',
  essentials: '生活必需',
  rewards: '享乐奖励',
};

export const EDUCATION_CATEGORY_DESCRIPTIONS: Record<EducationCategoryType, string> = {
  growth: '让钱为你工作，通过复利实现财富增长',
  stability: '建立应急储备，在危机中保持冷静',
  essentials: '生活必需品，聪明消费不是削减快乐',
  rewards: '无罪恶感享受生活，保持长期动力',
};

// All Categories (Combined)
export const CATEGORY_COLORS: Record<CategoryType, string> = {
  growth: '#10B981',
  stability: '#3B82F6',
  essentials: '#F59E0B',
  rewards: '#EC4899',
  special: '#8B5CF6',
};

export const CATEGORY_NAMES: Record<CategoryType, string> = {
  growth: '成长投资',
  stability: '稳健储蓄',
  essentials: '生活必需',
  rewards: '享乐奖励',
  special: '特殊用途',
};

export const CATEGORY_DESCRIPTIONS: Record<CategoryType, string> = {
  growth: '股票、ETF、指数基金等高增长投资',
  stability: '债券、应急基金、定期存款',
  essentials: '生活必需品，聪明消费',
  rewards: '旅行、娱乐、个人爱好',
  special: '教育基金、机会投资、其他目标',
};

export const CATEGORY_ICONS: Record<CategoryType, string> = {
  growth: 'TrendingUp',
  stability: 'Shield',
  essentials: 'Home',
  rewards: 'Gift',
  special: 'Target',
};

// Investment allocation defaults (for dashboard portfolio)
export const DEFAULT_INVESTMENT_ALLOCATION = {
  growth: 60,
  stability: 25,
  special: 15,
};

// Education allocation defaults (for teaching income split)
export const DEFAULT_EDUCATION_ALLOCATION = {
  growth: 25,
  stability: 15,
  essentials: 50,
  rewards: 10,
};

// Default allocation - includes all fields to avoid TypeScript undefined errors
export const DEFAULT_ALLOCATION = {
  growth: 25,
  stability: 15,
  special: 0,
  essentials: 50,
  rewards: 10,
};

// Preset investment strategies
export const INVESTMENT_PRESETS = {
  conservative: {
    name: '保守型',
    description: '低风险，稳健增长',
    allocation: { growth: 40, stability: 40, special: 20 },
  },
  moderate: {
    name: '稳健型',
    description: '平衡风险与收益',
    allocation: { growth: 60, stability: 25, special: 15 },
  },
  aggressive: {
    name: '进取型',
    description: '追求高收益',
    allocation: { growth: 80, stability: 10, special: 10 },
  },
};

export const ROUTES = {
  WELCOME: '/',
  LOGIN: '/login',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  DETAIL: '/detail/:type',
  ACCOUNTS: '/accounts',
  ALLOCATE_INCOME: '/allocate-income',
  ANALYTICS: '/analytics',
  INVESTMENT_GUIDANCE: '/investment-guidance',
  INSURANCE_PLANNING: '/insurance-planning',
  RETIREMENT_PLANNING: '/retirement-planning',
  VISITOR: '/visitor',
};

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

export const PRIMARY_GOAL_NAMES: Record<'retirement' | 'house' | 'education' | 'wealth' | 'security', string> = {
  retirement: '退休规划',
  house: '购房',
  education: '教育基金',
  wealth: '财富增长',
  security: '财务安全',
};
