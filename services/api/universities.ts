/**
 * Адаптер-seam ресурса «universities». Развилка мок/HTTP — по `ENV.useMocks`.
 */

import { ENV } from '@/constants/env';
import * as mock from '@/mocks/handlers/universities';

import * as http from './http/universities';

export type UniversitySearchResponse = mock.UniversitySearchResponse;
export type UniversityDetailResponse = mock.UniversityDetailResponse;

export interface UniversitiesApi {
  searchUniversities(): Promise<UniversitySearchResponse>;
  getUniversity(id: string, isPremium: boolean): Promise<UniversityDetailResponse>;
}

export const universitiesApi: UniversitiesApi = {
  searchUniversities: ENV.useMocks ? mock.searchUniversities : http.searchUniversities,
  getUniversity: ENV.useMocks ? mock.getUniversity : http.getUniversity,
};
