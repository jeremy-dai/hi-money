// Metadata for the UI to display options
// The actual data is now fetched from Supabase (see useAppStore.ts and EXAMPLE_USER_IDS in constants.ts)

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
