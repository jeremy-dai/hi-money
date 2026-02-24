import type { InsuranceCategory, InsuranceSubCategory } from '../types/insurance.types';

export const INSURANCE_CATEGORY_LABELS: Record<InsuranceCategory, string> = {
  protection: '保障型',
  savings: '储蓄型',
  investment: '投资型',
};

export const INSURANCE_SUBCATEGORY_LABELS: Record<InsuranceSubCategory, string> = {
  // Protection
  criticalIllness: '重疾险',
  medical: '医疗险',
  accident: '意外险',
  termLife: '定期寿险',
  cancer: '防癌险',
  
  // Savings
  increasingWholeLife: '增额终身寿险',
  pensionAnnuity: '养老年金',
  educationAnnuity: '教育金',
  endowment: '两全险',
  wholeLife: '终身寿险',
  
  // Investment
  participating: '分红险',
  universalLife: '万能险',
  unitLinked: '投连险',
};

export const INSURANCE_CATEGORY_COLORS: Record<InsuranceCategory, string> = {
  protection: '#10B981', // emerald-500
  savings: '#3B82F6',    // blue-500
  investment: '#8B5CF6', // violet-500
};

export const INSURANCE_CATEGORY_MAPPING: Record<InsuranceCategory, InsuranceSubCategory[]> = {
  protection: ['criticalIllness', 'medical', 'accident', 'termLife', 'cancer'],
  savings: ['increasingWholeLife', 'pensionAnnuity', 'educationAnnuity', 'endowment', 'wholeLife'],
  investment: ['participating', 'universalLife', 'unitLinked'],
};

// Helper to get subcategory label safely
export const getSubCategoryLabel = (sub?: string): string => {
  return sub && INSURANCE_SUBCATEGORY_LABELS[sub as InsuranceSubCategory] 
    ? INSURANCE_SUBCATEGORY_LABELS[sub as InsuranceSubCategory] 
    : sub || '未分类';
};
