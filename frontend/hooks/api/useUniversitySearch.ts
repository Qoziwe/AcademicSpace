/**
 * `useUniversitySearch()` — сгруппированный подбор Safety / Match / Reach
 * (`POST /api/v1/universities/search`).
 */

import { useQuery } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { universitiesApi } from '@/services/api/universities';

export function useUniversitySearch() {
  return useQuery({
    queryKey: qk.universitySearch(),
    queryFn: universitiesApi.searchUniversities,
  });
}
