import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate the current cash value based on policy start date and cash value schedule.
 * Returns the cash value amount for the completed policy years.
 */
export function calculateCurrentCashValue(
  startDate: string,
  schedule: { year: number; amount: number }[]
): number {
  if (!startDate || !schedule || schedule.length === 0) return 0;

  const start = new Date(startDate);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const years = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  const completedYears = Math.max(0, Math.floor(years));

  // Find the relevant record (max year <= completedYears)
  let bestRecord = null;
  let maxYear = -1;
  let minYear = 9999;

  for (const record of schedule) {
    if (record.year < minYear) minYear = record.year;
    if (record.year <= completedYears) {
      if (record.year > maxYear) {
        maxYear = record.year;
        bestRecord = record;
      }
    }
  }

  if (bestRecord) {
    return bestRecord.amount;
  } else if (completedYears < minYear) {
    return 0; // Before the first scheduled year
  }

  return 0;
}

