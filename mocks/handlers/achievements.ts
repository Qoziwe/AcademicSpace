/**
 * Мок-хендлер журнала выполненных заданий (ACHIEVEMENT_LOG).
 * Контракт — `docs/api-contract.md` §TBD (Achievement Log endpoints).
 */

import { delay } from '@/mocks/delay';
import { ACHIEVEMENT_LOG_DAYS, type LogDay } from '@/mocks/fixtures';

export interface AchievementLogResponse {
  totalXp: number;
  days: LogDay[];
}

export function getAchievementLog(): Promise<AchievementLogResponse> {
  return delay({ totalXp: 620, days: ACHIEVEMENT_LOG_DAYS });
}
