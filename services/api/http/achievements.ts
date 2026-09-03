import type { AchievementLogResponse } from '@/mocks/handlers/achievements';

import { apiFetch } from './client';

export function getAchievementLog(): Promise<AchievementLogResponse> {
  return apiFetch<AchievementLogResponse>('GET', '/achievements/log');
}
