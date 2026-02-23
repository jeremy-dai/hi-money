export interface SubCategory {
  id: string;
  name: string;
  parentCategory: 'growth' | 'stability' | 'special';
  color?: string;
}

export interface WorkspaceSettings {
  targetAllocation: {
    growth: number;
    stability: number;
    essentials: number;
    rewards: number;
  };
  subCategories: SubCategory[];
}

export const DEFAULT_SETTINGS: WorkspaceSettings = {
  targetAllocation: { growth: 25, stability: 15, essentials: 50, rewards: 10 },
  subCategories: [],
};
