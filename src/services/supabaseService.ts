
import { supabase } from '../lib/supabase';
import { createEmptyProfile } from '../store/useAppStore';
import type { ProfileData, SpendingRecord } from '../types';

// ---------------------------------------------------------------------------
// Core Sync Functions
// ---------------------------------------------------------------------------

export const fetchProfileData = async (userId: string): Promise<ProfileData | null> => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('profile_data')
      .eq('id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') return null;
      throw profileError;
    }

    const { data: spendingData } = await supabase
      .from('spending_records')
      .select('month, amount, note')
      .eq('user_id', userId)
      .order('month');

    return {
      ...createEmptyProfile(),
      ...(profile.profile_data ?? {}),
      spending: (spendingData ?? []).map((s: { month: string; amount: number; note?: string }) => ({
        month: s.month,
        amount: s.amount,
        note: s.note ?? undefined,
      })),
    };
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return null;
  }
};

export const saveProfileData = async (userId: string, data: ProfileData) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { spending: _spending, ...profileFields } = data;

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      profile_data: profileFields,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving profile data:', error);
  }
};

// ---------------------------------------------------------------------------
// Granular Spending Sync (called by store for per-month edits)
// ---------------------------------------------------------------------------

export const upsertSpendingRecord = async (userId: string, record: SpendingRecord) => {
  return supabase.from('spending_records').upsert({
    user_id: userId,
    month: record.month,
    amount: record.amount,
    note: record.note,
  }, { onConflict: 'user_id,month' });
};

export const deleteSpendingRecord = async (userId: string, month: string) => {
  return supabase.from('spending_records').delete()
    .eq('user_id', userId)
    .eq('month', month);
};
