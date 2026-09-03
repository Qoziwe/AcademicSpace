/**
 * Мок-хендлер журнала выполненных заданий (ACHIEVEMENT_LOG).
 * Контракт — `docs/api-contract.md` §Achievement Log.
 *
 * `totalXp` и записи за сегодня берутся из `mocks/store.ts`: закрытый
 * модуль начисляет XP и кладёт запись в `journalEntries`. Сид-история
 * (`ACHIEVEMENT_LOG_DAYS`) идёт следом, динамические записи домешиваются
 * в начало первого дня («сегодня»).
 */

import { delay } from '@/mocks/delay';
import { ACHIEVEMENT_LOG_DAYS, type LogDay } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';

export interface AchievementLogResponse {
  totalXp: number;
  days: LogDay[];
}

export function getAchievementLog(): Promise<AchievementLogResponse> {
  const { xp, journalEntries } = useMockStore.getState();

  const days: LogDay[] = ACHIEVEMENT_LOG_DAYS.map((d) => ({
    date: d.date,
    items: [...d.items],
  }));

  if (journalEntries.length > 0 && days[0]) {
    days[0] = { date: days[0].date, items: [...journalEntries, ...days[0].items] };
  }

  return delay({ totalXp: xp, days });
}
