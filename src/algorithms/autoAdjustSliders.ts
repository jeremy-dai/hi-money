import type { Allocation, CategoryType } from '../types';

/**
 * Auto-adjust allocation percentages when one slider changes
 * Ensures total always equals 100% by proportionally adjusting other sliders
 *
 * Ported from: pages/allocation/allocation.js lines 34-73
 */
export function autoAdjustAllocation(
  allocation: Allocation,
  changedField: CategoryType,
  newValue: number
): Allocation {
  const result = { ...allocation };

  // Update the changed field
  result[changedField] = newValue;

  // Get other fields
  const fields: CategoryType[] = ['growth', 'stability', 'essentials', 'rewards'];
  const otherFields = fields.filter(f => f !== changedField);

  // Calculate total of other fields
  let othersTotal = otherFields.reduce((sum, field) => sum + result[field], 0);

  // Remaining percentage to distribute
  const remaining = 100 - newValue;

  if (othersTotal > 0 && remaining >= 0) {
    // Proportionally adjust other fields
    otherFields.forEach(field => {
      const ratio = result[field] / othersTotal;
      result[field] = Math.round(remaining * ratio);
    });

    // Fix rounding errors
    const currentTotal = Object.values(result).reduce((sum, val) => sum + val, 0);
    if (currentTotal !== 100) {
      const adjust = 100 - currentTotal;
      result[otherFields[0]] += adjust;
    }
  }

  // Ensure all values are within 0-100
  (Object.keys(result) as CategoryType[]).forEach(key => {
    result[key] = Math.max(0, Math.min(100, result[key]));
  });

  return result;
}
