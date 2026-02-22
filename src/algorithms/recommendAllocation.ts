/**
 * Dynamic Allocation Recommendation Engine
 * 
 * Generates personalized allocation recommendations based on user profile.
 * Uses weighted factors: Age (40%), Family (30%), City Tier (15%), 
 * Mortgage (10%), Risk Tolerance (5%).
 */

import type { UserProfile, InsuranceProfile } from '../types/profile.types';
import type { AllocationRecommendation, IncomeAllocation, InvestmentPoolAllocation } from '../types/allocation.types';
import { calculateFinalAllocation } from '../types/allocation.types';

/**
 * Calculate recommended allocation based on user profile
 */
export function calculateRecommendedAllocation(
  profile: UserProfile,
  _insuranceProfile?: InsuranceProfile
): AllocationRecommendation {
  // Base allocation (neutral profile)
  let investmentPool = 45; // 45% of income
  let essentials = 45; // 45% of income
  let rewards = 10; // 10% of income
  
  let growthPct = 60; // 60% of investment pool
  let stabilityPct = 25; // 25% of investment pool
  let specialPct = 15; // 15% of investment pool
  
  const factors: Array<{ name: string; impact: string; weight: number }> = [];
  
  // Factor 1: Age (40% weight)
  const ageFactor = calculateAgeFactor(profile.age);
  factors.push({
    name: '年龄因素',
    impact: ageFactor.description,
    weight: 0.4,
  });
  
  if (profile.age < 30) {
    // Young: More aggressive growth
    growthPct += 15;
    stabilityPct -= 10;
    specialPct -= 5;
    investmentPool += 5; // Can invest more
    essentials -= 3;
    rewards -= 2;
  } else if (profile.age > 50) {
    // Older: More conservative
    growthPct -= 20;
    stabilityPct += 15;
    specialPct += 5;
    investmentPool -= 5; // Need more for essentials
    essentials += 5;
  }
  
  // Factor 2: Family Structure (30% weight)
  const familyFactor = calculateFamilyFactor(profile);
  factors.push({
    name: '家庭结构',
    impact: familyFactor.description,
    weight: 0.3,
  });
  
  if (profile.hasChildren) {
    // Per child: +5% essentials, +2% special for education
    const childAdjustment = profile.childrenCount * 5;
    essentials += childAdjustment;
    investmentPool -= childAdjustment * 0.6; // Reduce investment pool
    specialPct += profile.childrenCount * 2; // More for education
    growthPct -= profile.childrenCount * 1;
    stabilityPct -= profile.childrenCount * 1;
  }
  
  // Factor 3: City Tier (15% weight)
  const cityFactor = calculateCityFactor(profile.cityTier);
  factors.push({
    name: '城市等级',
    impact: cityFactor.description,
    weight: 0.15,
  });
  
  if (profile.cityTier === 1) {
    // Tier 1: Higher cost of living
    essentials += 10;
    investmentPool -= 8;
    rewards -= 2;
  } else if (profile.cityTier === 4) {
    // Tier 4: Lower cost of living
    essentials -= 5;
    investmentPool += 5;
  }
  
  // Factor 4: Mortgage Burden (10% weight)
  const mortgageFactor = calculateMortgageFactor(profile);
  factors.push({
    name: '房贷负担',
    impact: mortgageFactor.description,
    weight: 0.1,
  });
  
  if (profile.hasMortgage && profile.mortgageMonthly) {
    const mortgageRatio = (profile.mortgageMonthly / profile.monthlyIncome) * 100;
    if (mortgageRatio > 30) {
      // High mortgage burden
      growthPct -= 5;
      stabilityPct += 3;
      specialPct += 2;
      essentials += 5;
      investmentPool -= 5;
    }
  }
  
  // Factor 5: Risk Tolerance (5% weight)
  const riskFactor = calculateRiskFactor(profile.riskTolerance);
  factors.push({
    name: '风险偏好',
    impact: riskFactor.description,
    weight: 0.05,
  });
  
  if (profile.riskTolerance === 'aggressive') {
    growthPct += 10;
    stabilityPct -= 7;
    specialPct -= 3;
  } else if (profile.riskTolerance === 'conservative') {
    growthPct -= 10;
    stabilityPct += 10;
  }
  
  // Normalize investment pool percentages (must sum to 100)
  const totalInvestment = growthPct + stabilityPct + specialPct;
  if (totalInvestment !== 100) {
    const scale = 100 / totalInvestment;
    growthPct *= scale;
    stabilityPct *= scale;
    specialPct *= scale;
  }
  
  // Normalize income allocation (must sum to 100)
  const totalIncome = investmentPool + essentials + rewards;
  if (totalIncome !== 100) {
    const scale = 100 / totalIncome;
    investmentPool *= scale;
    essentials *= scale;
    rewards *= scale;
  }
  
  // Round to 1 decimal place
  investmentPool = Math.round(investmentPool * 10) / 10;
  essentials = Math.round(essentials * 10) / 10;
  rewards = Math.round(rewards * 10) / 10;
  growthPct = Math.round(growthPct * 10) / 10;
  stabilityPct = Math.round(stabilityPct * 10) / 10;
  specialPct = Math.round(specialPct * 10) / 10;
  
  const incomeAllocation: IncomeAllocation = {
    investmentPool,
    essentials,
    rewards,
  };
  
  const investmentAllocation: InvestmentPoolAllocation = {
    growth: growthPct,
    stability: stabilityPct,
    special: specialPct,
  };
  
  const finalAllocation = calculateFinalAllocation(incomeAllocation, investmentAllocation);
  
  // Generate summary
  const summary = generateSummary(profile, incomeAllocation, investmentAllocation);
  
  return {
    incomeAllocation,
    investmentAllocation,
    finalAllocation,
    rationale: {
      factors,
      summary,
    },
  };
}

/**
 * Calculate age factor impact
 */
function calculateAgeFactor(age: number): { description: string; multiplier: number } {
  if (age < 30) {
    return {
      description: `年轻（${age}岁），建议更积极的增长策略`,
      multiplier: 1.4,
    };
  } else if (age > 50) {
    return {
      description: `中年（${age}岁），建议更稳健的配置`,
      multiplier: 0.6,
    };
  }
  return {
    description: `中年（${age}岁），平衡增长与稳健`,
    multiplier: 1.0,
  };
}

/**
 * Calculate family structure factor
 */
function calculateFamilyFactor(profile: UserProfile): { description: string } {
  if (profile.hasChildren) {
    return {
      description: `有${profile.childrenCount}个孩子，需要更多生活必需和教育基金`,
    };
  } else if (profile.maritalStatus === 'married') {
    return {
      description: '已婚无子女，可适度增加投资比例',
    };
  }
  return {
    description: '单身，可更灵活配置资产',
  };
}

/**
 * Calculate city tier factor
 */
function calculateCityFactor(cityTier: number): { description: string } {
  const tierNames = ['一线', '二线', '三线', '四线'];
  if (cityTier === 1) {
    return {
      description: `${tierNames[cityTier - 1]}城市，生活成本较高`,
    };
  } else if (cityTier === 4) {
    return {
      description: `${tierNames[cityTier - 1]}城市，生活成本较低`,
    };
  }
  return {
    description: `${tierNames[cityTier - 1]}城市，生活成本适中`,
  };
}

/**
 * Calculate mortgage burden factor
 */
function calculateMortgageFactor(profile: UserProfile): { description: string } {
  if (!profile.hasMortgage || !profile.mortgageMonthly) {
    return {
      description: '无房贷负担',
    };
  }
  
  const ratio = (profile.mortgageMonthly / profile.monthlyIncome) * 100;
  if (ratio > 30) {
    return {
      description: `房贷负担较重（${ratio.toFixed(1)}%），需增加生活必需比例`,
    };
  }
  return {
    description: `房贷负担适中（${ratio.toFixed(1)}%）`,
  };
}

/**
 * Calculate risk tolerance factor
 */
function calculateRiskFactor(riskTolerance: string): { description: string } {
  const descriptions: Record<string, string> = {
    aggressive: '进取型，偏好高风险高收益',
    moderate: '稳健型，平衡风险与收益',
    conservative: '保守型，偏好低风险稳定收益',
  };
  return {
    description: descriptions[riskTolerance] || descriptions.moderate,
  };
}

/**
 * Generate human-readable summary
 */
function generateSummary(
  profile: UserProfile,
  incomeAlloc: IncomeAllocation,
  investmentAlloc: InvestmentPoolAllocation
): string {
  const parts: string[] = [];
  
  parts.push(`基于您的个人情况（${profile.age}岁，${getCityTierName(profile.cityTier)}城市`);
  
  if (profile.maritalStatus === 'married') {
    parts.push('已婚');
    if (profile.hasChildren) {
      parts.push(`有${profile.childrenCount}个孩子`);
    }
  } else {
    parts.push('单身');
  }
  
  parts.push(`，${getRiskToleranceName(profile.riskTolerance)}），`);
  
  parts.push(`建议将收入的${incomeAlloc.investmentPool}%用于投资，`);
  parts.push(`其中${investmentAlloc.growth}%配置成长投资，`);
  parts.push(`${investmentAlloc.stability}%配置稳健储蓄，`);
  parts.push(`${investmentAlloc.special}%配置特殊用途。`);
  parts.push(`生活必需占${incomeAlloc.essentials}%，`);
  parts.push(`享乐奖励占${incomeAlloc.rewards}%。`);
  
  return parts.join('');
}

function getCityTierName(tier: number): string {
  const names = ['一线', '二线', '三线', '四线'];
  return names[tier - 1] || '未知';
}

function getRiskToleranceName(tolerance: string): string {
  const names: Record<string, string> = {
    aggressive: '进取型',
    moderate: '稳健型',
    conservative: '保守型',
  };
  return names[tolerance] || '稳健型';
}

