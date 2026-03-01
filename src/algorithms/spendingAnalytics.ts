import type { SpendingRecord } from '../types/store.types';

/** 3-month moving average spending */
export function calculateMA3Spending(spending: SpendingRecord[]): number {
  if (spending.length === 0) return 0;
  const sorted = [...spending].sort((a, b) => a.month.localeCompare(b.month));
  const last3 = sorted.slice(-3);
  return Math.round(last3.reduce((sum, s) => sum + s.amount, 0) / last3.length);
}

export interface MonthlySpendingDataPoint {
  month: string;       // "2025-01"
  label: string;       // "1月"
  amount: number;
  ma3: number | null;  // null for first 2 months (insufficient data)
  note?: string;
}

/** Returns chart-ready data with MA-3 for each month */
export function getMonthlySpendingChartData(
  spending: SpendingRecord[]
): MonthlySpendingDataPoint[] {
  const sorted = [...spending].sort((a, b) => a.month.localeCompare(b.month));
  return sorted.map((s, i) => {
    const window = sorted.slice(Math.max(0, i - 2), i + 1);
    const ma3 =
      window.length >= 2
        ? Math.round(window.reduce((sum, x) => sum + x.amount, 0) / window.length)
        : null;
    const [, mm] = s.month.split('-');
    return { month: s.month, label: `${parseInt(mm)}月`, amount: s.amount, ma3, note: s.note || undefined };
  });
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  route?: string;
}

import type { ProfileData } from '../types/store.types';

/** Generate contextual action items from current profile state */
export function generateActionItems(data: ProfileData): ActionItem[] {
  const items: ActionItem[] = [];
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // No spending recorded this month
  const hasCurrentMonthSpending = data.spending.some(s => s.month === currentMonth);
  if (!hasCurrentMonthSpending) {
    items.push({
      id: 'record-spending',
      title: '记录本月支出',
      description: `尚未记录 ${currentMonth.replace('-', '年')}月的支出数据`,
      priority: 'high',
      route: '/spending',
    });
  }

  // No insurance policies
  if (data.policies.length === 0) {
    items.push({
      id: 'add-policy',
      title: '录入保单信息',
      description: '添加您的保险保单，系统将自动计算抗风险杠杆率',
      priority: 'high',
      route: '/assets',
    });
  }

  // No accounts
  const totalAccounts =
    data.accounts.growth.length +
    data.accounts.stability.length +
    data.accounts.special.length;
  if (totalAccounts === 0) {
    items.push({
      id: 'add-account',
      title: '添加投资账户',
      description: '录入您的基金、股票、存款账户，开始追踪净资产',
      priority: 'high',
      route: '/assets',
    });
  }

  // Profile incomplete
  if (!data.userProfile?.profileCompleted) {
    items.push({
      id: 'complete-profile',
      title: '完善个人信息',
      description: '补充基本资料，获取个性化的资产配置建议',
      priority: 'medium',
      route: '/onboarding',
    });
  }

  // Spending trend: last month significantly higher than MA-3
  if (data.spending.length >= 3) {
    const ma3 = calculateMA3Spending(data.spending);
    const lastMonth = [...data.spending].sort((a, b) => a.month.localeCompare(b.month)).slice(-1)[0];
    if (lastMonth && lastMonth.amount > ma3 * 1.15) {
      items.push({
        id: 'spending-spike',
        title: '本月支出偏高',
        description: `上月支出 ¥${lastMonth.amount.toLocaleString()}，高于近3月均值 ¥${ma3.toLocaleString()} 的15%`,
        priority: 'medium',
        route: '/spending',
      });
    }
  }

  return items;
}
