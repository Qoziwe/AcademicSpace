/**
 * Мок-хендлер подбора вузов. Контракт — `docs/api-contract.md`
 * §Questionnaire / Universities (`POST /api/v1/universities/search`).
 *
 * Прототип рисует один набор результатов независимо от страны — здесь так
 * же: страна из фильтров прокидывается в ответ, набор групп постоянный.
 */

import { delay } from '@/mocks/delay';
import { PROFILE, SEARCH_GROUPS, type SearchGroup } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';

export interface UniversitySearchResponse {
  country: string;
  matchesCount: number;
  rating: number;
  groups: SearchGroup[];
}

export function searchUniversities(): Promise<UniversitySearchResponse> {
  const { filters } = useMockStore.getState();
  return delay({
    country: filters.country,
    matchesCount: PROFILE.matchesCount,
    rating: PROFILE.rating,
    groups: SEARCH_GROUPS,
  });
}
