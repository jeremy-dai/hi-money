import { supabase } from '@/lib/supabase';
import type { InsurancePolicy } from '@/types/insurance.types';

/**
 * Call the extract-policies Edge Function to parse insurance document text.
 * The DashScope API key is stored server-side as a Supabase secret.
 */
export async function extractPoliciesFromText(
  text: string,
): Promise<Partial<InsurancePolicy>[]> {
  const { data, error } = await supabase.functions.invoke('extract-policies', {
    body: { text },
  });

  if (error) {
    throw new Error(error.message || 'AI 解析请求失败');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  const policies = data?.policies;
  if (!Array.isArray(policies)) {
    throw new Error('AI 返回格式错误，期望保单数组');
  }

  return policies as Partial<InsurancePolicy>[];
}
