export interface SubCategory {
  id: string;
  name: string;
  parentCategory: 'growth' | 'stability' | 'special' | 'emergency';
  color?: string;
}

export interface WorkspaceSettings {
  targetAllocation: {
    growth: number;
    stability: number;
    essentials: number;
    rewards: number;
  };
  /** User-overridden investment pool targets (growth/stability/special %). If null, uses algorithm recommendation. */
  investmentTargets?: {
    growth: number;
    stability: number;
    special: number;
  } | null;
  subCategories: SubCategory[];
}

export const DEFAULT_SETTINGS: WorkspaceSettings = {
  targetAllocation: { growth: 25, stability: 15, essentials: 50, rewards: 10 },
  subCategories: [],
};
