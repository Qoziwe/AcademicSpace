/**
 * Адаптер-seam ресурса «achievements» (журнал выполненного). Развилка
 * мок/HTTP — по `ENV.useMocks`.
 */

import { ENV } from '@/constants/env';
import * as mock from '@/mocks/handlers/achievements';

import * as http from './http/achievements';

export type AchievementLogResponse = mock.AchievementLogResponse;

export interface AchievementsApi {
  getAchievementLog(): Promise<AchievementLogResponse>;
}

export const achievementsApi: AchievementsApi = {
  getAchievementLog: ENV.useMocks ? mock.getAchievementLog : http.getAchievementLog,
};
