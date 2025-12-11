// Payout Rate Configuration Utility
// Bu utility payout rate'ni localStorage'da saqlash va olish uchun ishlatiladi

const PAYOUT_RATE_KEY = 'academy_payout_rate';
const DEFAULT_PAYOUT_RATE = 0.35; // 35%

/**
 * Payout rate'ni localStorage'dan olish
 * Agar saqlanmagan bo'lsa, default qiymatni qaytaradi
 */
export function getPayoutRate(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_PAYOUT_RATE;
  }

  try {
    const stored = localStorage.getItem(PAYOUT_RATE_KEY);
    if (stored) {
      const parsed = parseFloat(stored);
      // 0.20 dan 0.60 gacha bo'lishi kerak (20% - 60%)
      if (!isNaN(parsed) && parsed >= 0.20 && parsed <= 0.60) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading payout rate from localStorage:', error);
  }

  return DEFAULT_PAYOUT_RATE;
}

/**
 * Payout rate'ni localStorage'ga saqlash
 * @param rate - 0.20 dan 0.60 gacha (20% - 60%)
 */
export function setPayoutRate(rate: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Validatsiya: 20% - 60% orasida bo'lishi kerak
    const validatedRate = Math.max(0.20, Math.min(0.60, rate));
    localStorage.setItem(PAYOUT_RATE_KEY, validatedRate.toString());
  } catch (error) {
    console.error('Error saving payout rate to localStorage:', error);
  }
}

/**
 * O'qituvchi oyligini hisoblash
 * @param groupsRevenue - O'qituvchining barcha guruhlaridan olingan oylik daromad
 * @param payoutRate - Ulush (default: localStorage'dan olinadi)
 * @returns Hisoblangan oylik
 */
export function calculateTeacherSalary(groupsRevenue: number, payoutRate?: number): number {
  const rate = payoutRate ?? getPayoutRate();
  return groupsRevenue * rate;
}

