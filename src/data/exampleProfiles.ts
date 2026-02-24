import type { ProfileData } from '../types';
import { DEFAULT_SETTINGS } from '../types/settings.types';

// ---------------------------------------------------------------------------
// Metadata for the UI to display options
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Full profile data — local static data, no Supabase required
// ---------------------------------------------------------------------------
export const EXAMPLE_PROFILES: Record<string, ProfileData> = {
  'fresh-graduate': {
    monthlyIncome: 15000,
    allocation: { growth: 25, stability: 15, essentials: 50, rewards: 10 },
    accounts: {
      growth: [
        { name: '支付宝基金账户', amount: 35000 },
        { name: '华泰证券账户', amount: 20000 },
      ],
      stability: [
        { name: '招商银行储蓄', amount: 15000 },
      ],
      special: [],
    },
    spending: [
      { month: '2025-12', amount: 9000, note: '房租・餐饮・交通・娱乐' },
      { month: '2026-01', amount: 7400, note: '房租・餐饮・交通' },
      { month: '2026-02', amount: 7200, note: '房租・餐饮' },
    ],
    policies: [
      {
        id: 'eg-fg-pol-1',
        name: '百万医疗险',
        type: 'medical',
        category: 'protection',
        subCategory: 'medical',
        isTaxAdvantaged: false,
        annualPremium: 360,
        cashValue: 0,
        coverageAmount: 3000000,
        startDate: '2024-01-01',
        benefits: { deductible: '10000' },
      },
      {
        id: 'eg-fg-pol-2',
        name: '综合意外险',
        type: 'accident',
        category: 'protection',
        subCategory: 'accident',
        isTaxAdvantaged: false,
        annualPremium: 200,
        cashValue: 0,
        coverageAmount: 500000,
        startDate: '2024-01-01',
        benefits: { disability: '500000' },
      },
    ],
    userProfile: {
      age: 25,
      cityTier: 1,
      maritalStatus: 'single',
      hasChildren: false,
      childrenCount: 0,
      childrenAges: [],
      monthlyIncome: 15000,
      hasMortgage: false,
      existingDebts: 0,
      riskTolerance: 'aggressive',
      primaryGoal: 'wealth',
      retirementAge: 60,
      dependents: 0,
      parentsCare: false,
      profileCompleted: true,
      lastUpdated: '2026-01-01T00:00:00.000Z',
    },
    settings: DEFAULT_SETTINGS,
  },

  'mid-career-family': {
    monthlyIncome: 35000,
    allocation: { growth: 20, stability: 20, essentials: 50, rewards: 10 },
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
    spending: [
      { month: '2025-12', amount: 16000, note: '房贷・餐饮・子女教育' },
      { month: '2026-01', amount: 18000, note: '房贷・餐饮・子女教育・交通' },
      { month: '2026-02', amount: 15500, note: '房贷・餐饮・子女教育' },
    ],
    policies: [
      {
        id: 'eg-mc-pol-1',
        name: '定期寿险 (夫)',
        type: 'life',
        category: 'protection',
        subCategory: 'termLife',
        isTaxAdvantaged: false,
        annualPremium: 2000,
        cashValue: 0,
        coverageAmount: 2000000,
        startDate: '2022-01-01',
        benefits: { term: '20 years' },
      },
      {
        id: 'eg-mc-pol-2',
        name: '重疾险 (夫)',
        type: 'critical_illness',
        category: 'protection',
        subCategory: 'criticalIllness',
        isTaxAdvantaged: false,
        annualPremium: 6000,
        cashValue: 20000,
        coverageAmount: 500000,
        startDate: '2022-01-01',
        benefits: { term: 'lifetime' },
      },
      {
        id: 'eg-mc-pol-3',
        name: '少儿医保+医疗',
        type: 'medical',
        category: 'protection',
        subCategory: 'medical',
        isTaxAdvantaged: false,
        annualPremium: 500,
        cashValue: 0,
        coverageAmount: 2000000,
        startDate: '2022-06-01',
        benefits: { insured: 'child' },
      },
    ],
    userProfile: {
      age: 35,
      cityTier: 2,
      maritalStatus: 'married',
      hasChildren: true,
      childrenCount: 2,
      childrenAges: [5, 2],
      monthlyIncome: 35000,
      hasMortgage: true,
      mortgageMonthly: 8000,
      existingDebts: 0,
      riskTolerance: 'moderate',
      primaryGoal: 'education',
      retirementAge: 60,
      dependents: 2,
      parentsCare: true,
      profileCompleted: true,
      lastUpdated: '2026-01-01T00:00:00.000Z',
    },
    settings: DEFAULT_SETTINGS,
  },

  'high-net-worth': {
    monthlyIncome: 120000,
    allocation: { growth: 25, stability: 15, essentials: 40, rewards: 20 },
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
    spending: [
      { month: '2025-12', amount: 60000, note: '房产・教育・生活・家政' },
      { month: '2026-01', amount: 75000, note: '房产・国际教育・生活・家政' },
      { month: '2026-02', amount: 40000, note: '房产维护・高端生活' },
    ],
    policies: [
      {
        id: 'eg-hnw-pol-1',
        name: '终身寿险信托',
        type: 'life',
        category: 'savings',
        subCategory: 'wholeLife',
        isTaxAdvantaged: false,
        annualPremium: 100000,
        cashValue: 500000,
        coverageAmount: 10000000,
        startDate: '2015-01-01',
        benefits: { beneficiary: 'trust' },
      },
      {
        id: 'eg-hnw-pol-2',
        name: '高端医疗险 (全球)',
        type: 'medical',
        category: 'protection',
        subCategory: 'medical',
        isTaxAdvantaged: false,
        annualPremium: 20000,
        cashValue: 0,
        coverageAmount: 50000000,
        startDate: '2018-01-01',
        benefits: { region: 'global' },
      },
      {
        id: 'eg-hnw-pol-3',
        name: '养老年金险',
        type: 'annuity',
        category: 'savings',
        subCategory: 'pensionAnnuity',
        isTaxAdvantaged: false,
        annualPremium: 50000,
        cashValue: 200000,
        coverageAmount: 0,
        startDate: '2020-01-01',
        benefits: { payout_start_age: '60' },
      },
    ],
    userProfile: {
      age: 45,
      cityTier: 1,
      maritalStatus: 'married',
      hasChildren: true,
      childrenCount: 2,
      childrenAges: [15, 12],
      monthlyIncome: 120000,
      hasMortgage: false,
      existingDebts: 0,
      riskTolerance: 'conservative',
      primaryGoal: 'wealth',
      retirementAge: 55,
      dependents: 2,
      parentsCare: true,
      currentPensionContribution: 50000,
      expectedMonthlyExpense: 30000,
      desiredLifestyle: 'affluent',
      retirementLocation: 'tier1',
      profileCompleted: true,
      lastUpdated: '2026-01-01T00:00:00.000Z',
    },
    settings: DEFAULT_SETTINGS,
  },
};
