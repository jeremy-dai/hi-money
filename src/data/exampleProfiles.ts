
import type { ProfileData, Accounts, HistoryRecord } from '../types';
import { DEFAULT_ALLOCATION } from '../utils/constants';

// Helper to create a consistent history record
const createHistoryRecord = (
  dateOffsetDays: number, 
  totalAmount: number, 
  accounts: Accounts, 
  income: number = 0,
  type: 'initial' | 'income' | 'update' = 'update'
): HistoryRecord => {
  const date = new Date();
  date.setDate(date.getDate() - dateOffsetDays);
  
  return {
    date: date.toISOString(),
    type,
    totalAmount,
    income,
    snapshot: {
      accounts,
      policies: [],
      monthlyIncome: income,
      allocation: DEFAULT_ALLOCATION
    }
  };
};

const DEFAULT_ACCOUNTS: Accounts = {
  growth: [],
  stability: [],
  special: []
};

// ---------------------------------------------------------------------------
// Profile 1: Fresh Graduate (Young Single)
// ---------------------------------------------------------------------------
const freshGraduate: ProfileData = {
  monthlyIncome: 15000,
  allocation: DEFAULT_ALLOCATION,
  accounts: {
    growth: [
      { name: '支付宝基金账户', amount: 35000 },
      { name: '华泰证券账户', amount: 20000 },
    ],
    stability: [
      { name: '招商银行储蓄', amount: 15000 },
    ],
    special: [
      { name: '教育基金', amount: 0 },
    ],
  },
  history: [
    createHistoryRecord(90, 50000, { ...DEFAULT_ACCOUNTS, growth: [{ name: 'Fund', amount: 40000 }], stability: [{ name: 'Cash', amount: 10000 }] }, 0, 'initial'),
    createHistoryRecord(60, 55000, { ...DEFAULT_ACCOUNTS, growth: [{ name: 'Fund', amount: 45000 }], stability: [{ name: 'Cash', amount: 10000 }] }, 15000, 'income'),
    createHistoryRecord(30, 70000, { ...DEFAULT_ACCOUNTS, growth: [{ name: 'Fund', amount: 55000 }], stability: [{ name: 'Cash', amount: 15000 }] }, 15000, 'income'),
  ],
  spending: [],
  userProfile: {
    // Demographics
    age: 25,
    cityTier: 1,
    maritalStatus: 'single',
    hasChildren: false,
    childrenCount: 0,
    childrenAges: [],
    
    // Financial
    monthlyIncome: 15000,
    hasMortgage: false,
    existingDebts: 0,
    
    // Goals
    riskTolerance: 'aggressive',
    primaryGoal: 'wealth',
    retirementAge: 60,
    
    // Insurance (merged)
    dependents: 0,
    parentsCare: false,
    
    // Retirement (merged)
    currentPensionContribution: 1200,
    expectedMonthlyExpense: 10500,
    desiredLifestyle: 'comfortable',
    retirementLocation: 'tier1',
    
    // Meta
    profileCompleted: true,
    lastUpdated: new Date().toISOString(),
  },
  policies: [],
  settings: null,
};

// ---------------------------------------------------------------------------
// Profile 2: Mid-Career Family (35yo, Married, 1 Kid)
// ---------------------------------------------------------------------------
const midCareerFamily: ProfileData = {
  monthlyIncome: 35000,
  allocation: DEFAULT_ALLOCATION,
  accounts: {
    growth: [
      { name: '股票账户', amount: 150000 },
      { name: '指数基金定投', amount: 80000 },
    ],
    stability: [
      { name: '家庭备用金', amount: 100000 },
      { name: '大额存单', amount: 200000 },
    ],
    special: [
      { name: '子女教育金', amount: 50000 },
    ],
  },
  history: [
    createHistoryRecord(90, 500000, { ...DEFAULT_ACCOUNTS }, 0, 'initial'),
    createHistoryRecord(30, 580000, { ...DEFAULT_ACCOUNTS }, 35000, 'income'),
  ],
  spending: [],
  userProfile: {
    age: 35,
    cityTier: 2,
    maritalStatus: 'married',
    hasChildren: true,
    childrenCount: 1,
    childrenAges: [5],
    monthlyIncome: 35000,
    hasMortgage: true,
    mortgageMonthly: 8000,
    existingDebts: 1200000,
    riskTolerance: 'moderate',
    primaryGoal: 'education',
    retirementAge: 60,
    dependents: 1,
    parentsCare: true,
    currentPensionContribution: 3000,
    expectedMonthlyExpense: 15000,
    desiredLifestyle: 'comfortable',
    retirementLocation: 'tier2',
    profileCompleted: true,
    lastUpdated: new Date().toISOString(),
  },
  policies: [],
  settings: null,
};

// ---------------------------------------------------------------------------
// Profile 3: High Net Worth (45yo, Business Owner)
// ---------------------------------------------------------------------------
const highNetWorth: ProfileData = {
  monthlyIncome: 120000,
  allocation: DEFAULT_ALLOCATION,
  accounts: {
    growth: [
      { name: '私募股权基金', amount: 2000000 },
      { name: '美股账户', amount: 1500000 },
    ],
    stability: [
      { name: '信托理财', amount: 3000000 },
      { name: '现金等价物', amount: 500000 },
    ],
    special: [
      { name: '家族传承基金', amount: 1000000 },
    ],
  },
  history: [
    createHistoryRecord(90, 7500000, { ...DEFAULT_ACCOUNTS }, 0, 'initial'),
    createHistoryRecord(30, 8000000, { ...DEFAULT_ACCOUNTS }, 120000, 'income'),
  ],
  spending: [],
  userProfile: {
    age: 45,
    cityTier: 1,
    maritalStatus: 'married',
    hasChildren: true,
    childrenCount: 2,
    childrenAges: [12, 8],
    monthlyIncome: 120000,
    hasMortgage: false,
    existingDebts: 0,
    riskTolerance: 'conservative',
    primaryGoal: 'wealth',
    retirementAge: 55,
    dependents: 2,
    parentsCare: true,
    currentPensionContribution: 0,
    expectedMonthlyExpense: 50000,
    desiredLifestyle: 'affluent',
    retirementLocation: 'tier1',
    profileCompleted: true,
    lastUpdated: new Date().toISOString(),
  },
  policies: [],
  settings: null,
};

export const EXAMPLE_PROFILES: Record<string, ProfileData> = {
  'fresh-graduate': freshGraduate,
  'mid-career-family': midCareerFamily,
  'high-net-worth': highNetWorth,
};

export const EXAMPLE_PROFILE_METADATA: Array<{
  id: string;
  name: string;
  description: string;
  label: string;
  tag: string;
  incomeLabel: string;
}> = [
  {
    id: 'fresh-graduate',
    name: '年轻单身白领（北京）',
    description: '25岁，月入15000，无房贷，追求财富增长',
    label: '年轻单身白领',
    tag: '职场新人',
    incomeLabel: '月入 1.5万',
  },
  {
    id: 'mid-career-family',
    name: '中产二胎家庭',
    description: '35岁，月入35000，有房贷，子女教育规划',
    label: '中产二胎家庭',
    tag: '家庭顶梁柱',
    incomeLabel: '月入 3.5万',
  },
  {
    id: 'high-net-worth',
    name: '高净值企业家',
    description: '45岁，月入12万，资产配置与传承',
    label: '高净值企业家',
    tag: '财富自由',
    incomeLabel: '月入 12万+',
  },
];
