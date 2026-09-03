/**
 * Мок-хендлер подбора вузов. Контракт — `docs/api-contract.md`
 * §Questionnaire / Universities (`POST /api/v1/universities/search`).
 *
 * Прототип рисует один набор результатов независимо от страны — здесь так
 * же: страна из фильтров прокидывается в ответ, набор групп постоянный.
 */

import { delay } from '@/mocks/delay';
import {
  PROFILE,
  SEARCH_GROUPS,
  UNIVERSITY_DETAIL,
  type SearchGroup,
  type UniCategoryKey,
} from '@/mocks/fixtures';
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

export interface UniversityDetailResponse {
  id: string;
  name: string;
  city: string;
  category: UniCategoryKey;
  admissionsUrl: string;
  stats: { k: string; v: string }[];
  rows: { k: string; v: string }[];
  /** Список названий документов — только для Premium; иначе `null`. */
  requiredDocuments: string[] | null;
  /** Текст блока документов: разбор для Premium / тизер замка для Free. */
  documentsNote: string;
}

/**
 * Карточка вуза (`GET /api/v1/universities/:id`). Имя/город берём из
 * результатов подбора по `id`, остальное — общий справочник
 * (`UNIVERSITY_DETAIL`); в прототипе карточка захардкожена под Bologna.
 */
export function getUniversity(id: string, isPremium: boolean): Promise<UniversityDetailResponse> {
  let found: { name: string; city: string } | undefined;
  let category: UniCategoryKey = 'match';
  for (const g of SEARCH_GROUPS) {
    const item = g.items.find((i) => i.id === id);
    if (item) {
      found = { name: item.name, city: item.city };
      category = g.category;
      break;
    }
  }

  return delay({
    id,
    name: found?.name ?? 'Università di Bologna',
    city: `${found?.city ?? 'Болонья, Италия'} · ${UNIVERSITY_DETAIL.foundedNote}`,
    category,
    admissionsUrl: UNIVERSITY_DETAIL.admissionsUrl,
    stats: [...UNIVERSITY_DETAIL.stats],
    rows: [...UNIVERSITY_DETAIL.rows],
    requiredDocuments: isPremium
      ? [
          'Аттестат с апостилем',
          'IELTS сертификат',
          'Мотивационное письмо',
          'Рекомендация №1',
          'Рекомендация №2',
          'Dichiarazione di valore',
        ]
      : null,
    documentsNote: isPremium ? UNIVERSITY_DETAIL.docTextPremium : UNIVERSITY_DETAIL.docTextFree,
  });
}
