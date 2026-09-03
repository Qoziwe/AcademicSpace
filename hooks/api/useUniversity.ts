/**
 * `useUniversity(id)` — карточка вуза (`GET /api/v1/universities/:id`).
 * `requiredDocuments` приходит непустым только для Premium — блок
 * документов на UNIVERSITY_DETAILS для Free показывает lock-тизер.
 */

import { useQuery } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { getUniversity } from '@/mocks/handlers/universities';
import { useSessionStore } from '@/stores/session';

export function useUniversity(id: string) {
  const plan = useSessionStore((s) => s.plan);
  return useQuery({
    queryKey: [...qk.university(id), plan],
    queryFn: () => getUniversity(id, plan === 'premium'),
  });
}
