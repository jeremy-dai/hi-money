import type { CategoryType } from '../types';

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  growth: '#10B981',
  stability: '#3B82F6',
  essentials: '#F59E0B',
  rewards: '#F9A8D4',
};

export const CATEGORY_NAMES: Record<CategoryType, string> = {
  growth: '成长投资',
  stability: '稳健储蓄',
  essentials: '生活必需',
  rewards: '享乐奖励',
};

export const CATEGORY_ICONS: Record<CategoryType, string> = {
  growth: '📈',
  stability: '🏦',
  essentials: '🏠',
  rewards: '🎁',
};

export const CATEGORY_DESCRIPTIONS: Record<CategoryType, string> = {
  growth: '股票、基金等高收益投资',
  stability: '定期存款、债券等稳健理财',
  essentials: '房租、水电、日常开销',
  rewards: '旅行、娱乐、个人爱好',
};

export const DEFAULT_ALLOCATION = {
  growth: 25,
  stability: 15,
  essentials: 50,
  rewards: 10,
};

export const ROUTES = {
  WELCOME: '/',
  INCOME: '/income',
  ALLOCATION: '/allocation',
  GOAL: '/goal',
  DASHBOARD: '/dashboard',
  DETAIL: '/detail/:type',
  ACCOUNTS: '/accounts',
  ALLOCATE_INCOME: '/allocate-income',
  ANALYTICS: '/analytics',
  INVESTMENT_GUIDANCE: '/investment-guidance',
};
