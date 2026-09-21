import type {
  UniversityDetailResponse,
  UniversitySearchResponse,
} from '@/mocks/handlers/universities';

import { apiFetch } from './client';

export function searchUniversities(): Promise<UniversitySearchResponse> {
  // Тело запроса (страна/вузы/факультет/язык/бюджет) бекенд возьмёт из
  // сохранённой анкеты — форму параметров зафиксирует Фаза 8.
  return apiFetch<UniversitySearchResponse>('POST', '/universities/search');
}

export function getUniversity(id: string): Promise<UniversityDetailResponse> {
  // `requiredDocuments`/`documentsNote` бекенд отфильтрует по плану сам.
  return apiFetch<UniversityDetailResponse>('GET', `/universities/${id}`);
}
