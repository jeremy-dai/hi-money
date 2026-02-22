/**
 * Visitor Mode Types
 * 
 * Types for demo mode functionality that allows insurance advisors
 * to demonstrate the platform with pre-configured scenarios.
 */

import type { UserProfile, InsuranceProfile, RetirementProfile } from './profile.types';
import type { Accounts, HistoryRecord, Allocation } from './store.types';

/**
 * Demo scenario configuration
 * Contains all data needed to demonstrate the platform
 */
export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  profile: UserProfile;
  insuranceProfile?: InsuranceProfile;
  retirementProfile?: RetirementProfile;
  mockAccounts: Accounts;
  mockHistory: HistoryRecord[];
  mockAllocation?: Allocation;
  mockMonthlyIncome?: number;
}
