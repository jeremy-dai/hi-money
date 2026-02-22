/**
 * Demo Scenarios for Visitor Mode
 * 
 * Pre-configured scenarios for insurance advisors to demonstrate
 * the platform to clients. Each scenario includes complete profile
 * data, mock accounts, and history.
 */

import type { DemoScenario } from '../types/visitor.types';
import { DEFAULT_ALLOCATION } from '../utils/constants';

/**
 * Scenario 1: 年轻单身白领（北京）
 * 25岁，月入15000，无房贷，追求财富增长
 */
const scenario1: DemoScenario = {
  id: 'young-single-beijing',
  name: '年轻单身白领（北京）',
  description: '25岁，月入15000，无房贷，追求财富增长',
  profile: {
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
    profileCompleted: true,
    lastUpdated: new Date().toISOString(),
  },
  insuranceProfile: {
    existingCoverage: {
      medicalInsurance: 0,
      lifeInsurance: 0,
      criticalIllness: 0,
      accidentInsurance: 0,
    },
    existingCoverageAmount: {
      life: 0,
      criticalIllness: 0,
      medical: 0,
    },
    dependents: 0,
    parentsCare: false,
  },
  retirementProfile: {
    currentPensionContribution: 1200,
    expectedMonthlyExpense: 10500,
    desiredLifestyle: 'comfortable',
    retirementLocation: 'tier1',
  },
  mockAccounts: {
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
    essentials: [],
    rewards: [],
  },
  mockHistory: [
    {
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'initial',
      totalAmount: 50000,
      snapshot: {
        growth: 40000,
        stability: 10000,
        essentials: 0,
        rewards: 0,
      },
    },
    {
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'income',
      income: 15000,
      totalAmount: 55000,
      snapshot: {
        growth: 45000,
        stability: 10000,
        essentials: 0,
        rewards: 0,
      },
      allocation: DEFAULT_ALLOCATION,
    },
    {
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'income',
      income: 15000,
      totalAmount: 70000,
      snapshot: {
        growth: 55000,
        stability: 15000,
        essentials: 0,
        rewards: 0,
      },
      allocation: DEFAULT_ALLOCATION,
    },
  ],
  mockAllocation: {
    growth: 40,
    stability: 10,
    special: 0,
    essentials: 40,
    rewards: 10,
  },
  mockMonthlyIncome: 15000,
};

/**
 * Scenario 2: 年轻家庭（杭州）
 * 35岁，已婚2孩，月入30000，有房贷
 */
const scenario2: DemoScenario = {
  id: 'young-family-hangzhou',
  name: '年轻家庭（杭州）',
  description: '35岁，已婚2孩，月入30000，有房贷',
  profile: {
    age: 35,
    cityTier: 2,
    maritalStatus: 'married',
    hasChildren: true,
    childrenCount: 2,
    childrenAges: [5, 8],
    monthlyIncome: 30000,
    hasMortgage: true,
    mortgageMonthly: 10000,
    existingDebts: 0,
    riskTolerance: 'moderate',
    primaryGoal: 'education',
    retirementAge: 60,
    profileCompleted: true,
    lastUpdated: new Date().toISOString(),
  },
  insuranceProfile: {
    existingCoverage: {
      medicalInsurance: 1000000,
      lifeInsurance: 500000,
      criticalIllness: 200000,
      accidentInsurance: 500000,
    },
    existingCoverageAmount: {
      life: 500000,
      criticalIllness: 200000,
      medical: 1000000,
    },
    dependents: 2,
    parentsCare: true,
  },
  retirementProfile: {
    currentPensionContribution: 2400,
    expectedMonthlyExpense: 21000,
    desiredLifestyle: 'comfortable',
    retirementLocation: 'tier2',
  },
  mockAccounts: {
    growth: [
      { name: '支付宝基金账户', amount: 60000 },
      { name: '华泰证券账户', amount: 40000 },
    ],
    stability: [
      { name: '招商银行储蓄', amount: 50000 },
    ],
    special: [
      { name: '教育基金', amount: 30000 },
    ],
    essentials: [],
    rewards: [],
  },
  mockHistory: [
    {
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'initial',
      totalAmount: 150000,
      snapshot: {
        growth: 80000,
        stability: 40000,
        essentials: 0,
        rewards: 0,
      },
    },
    {
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'income',
      income: 30000,
      totalAmount: 165000,
      snapshot: {
        growth: 95000,
        stability: 45000,
        essentials: 0,
        rewards: 0,
      },
      allocation: {
        growth: 20,
        stability: 20,
        special: 10,
        essentials: 50,
        rewards: 0,
      },
    },
    {
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'income',
      income: 30000,
      totalAmount: 180000,
      snapshot: {
        growth: 100000,
        stability: 50000,
        essentials: 0,
        rewards: 0,
      },
      allocation: {
        growth: 20,
        stability: 20,
        special: 10,
        essentials: 50,
        rewards: 0,
      },
    },
  ],
  mockAllocation: {
    growth: 20,
    stability: 20,
    special: 10,
    essentials: 50,
    rewards: 0,
  },
  mockMonthlyIncome: 30000,
};

/**
 * Scenario 3: 中年无房贷（成都）
 * 42岁，已婚1孩，月入25000，无房贷，稳健投资
 */
const scenario3: DemoScenario = {
  id: 'middle-aged-chengdu',
  name: '中年无房贷（成都）',
  description: '42岁，已婚1孩，月入25000，无房贷，稳健投资',
  profile: {
    age: 42,
    cityTier: 3,
    maritalStatus: 'married',
    hasChildren: true,
    childrenCount: 1,
    childrenAges: [12],
    monthlyIncome: 25000,
    hasMortgage: false,
    existingDebts: 0,
    riskTolerance: 'conservative',
    primaryGoal: 'retirement',
    retirementAge: 60,
    profileCompleted: true,
    lastUpdated: new Date().toISOString(),
  },
  insuranceProfile: {
    existingCoverage: {
      medicalInsurance: 2000000,
      lifeInsurance: 1000000,
      criticalIllness: 500000,
      accidentInsurance: 1000000,
    },
    existingCoverageAmount: {
      life: 1000000,
      criticalIllness: 500000,
      medical: 2000000,
    },
    dependents: 1,
    parentsCare: true,
  },
  retirementProfile: {
    currentPensionContribution: 2000,
    expectedMonthlyExpense: 17500,
    desiredLifestyle: 'comfortable',
    retirementLocation: 'tier3',
  },
  mockAccounts: {
    growth: [
      { name: '支付宝基金账户', amount: 80000 },
      { name: '华泰证券账户', amount: 60000 },
    ],
    stability: [
      { name: '招商银行储蓄', amount: 100000 },
      { name: '定期存款', amount: 50000 },
    ],
    special: [
      { name: '教育基金', amount: 40000 },
    ],
    essentials: [],
    rewards: [],
  },
  mockHistory: [
    {
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'initial',
      totalAmount: 250000,
      snapshot: {
        growth: 120000,
        stability: 100000,
        essentials: 0,
        rewards: 0,
      },
    },
    {
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'income',
      income: 25000,
      totalAmount: 270000,
      snapshot: {
        growth: 130000,
        stability: 110000,
        essentials: 0,
        rewards: 0,
      },
      allocation: {
        growth: 15,
        stability: 30,
        special: 15,
        essentials: 40,
        rewards: 0,
      },
    },
    {
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'income',
      income: 25000,
      totalAmount: 290000,
      snapshot: {
        growth: 140000,
        stability: 120000,
        essentials: 0,
        rewards: 0,
      },
      allocation: {
        growth: 15,
        stability: 30,
        special: 15,
        essentials: 40,
        rewards: 0,
      },
    },
  ],
  mockAllocation: {
    growth: 15,
    stability: 30,
    special: 15,
    essentials: 40,
    rewards: 0,
  },
  mockMonthlyIncome: 25000,
};

/**
 * Export all demo scenarios
 */
export const DEMO_SCENARIOS: DemoScenario[] = [
  scenario1,
  scenario2,
  scenario3,
];

/**
 * Get a scenario by ID
 */
export function getScenarioById(id: string): DemoScenario | undefined {
  return DEMO_SCENARIOS.find((s) => s.id === id);
}

