/**
 * `useAchievementLog()` — журнал выполненных заданий (ACHIEVEMENT_LOG),
 * группировка по датам.
 */

import { useQuery } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { getAchievementLog } from '@/mocks/handlers/achievements';

export function useAchievementLog() {
  return useQuery({ queryKey: qk.achievementLog(), queryFn: getAchievementLog });
}
