/**
 * `useProfile()` — профиль пользователя (`GET /api/v1/profile/me`).
 * Пока за хуком мок-хендлер; форма ответа зафиксирована в
 * `docs/api-contract.md`.
 */

import { useQuery } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { getProfile } from '@/mocks/handlers/profile';
import { useSessionStore } from '@/stores/session';

export function useProfile() {
  const plan = useSessionStore((s) => s.plan);
  return useQuery({
    queryKey: qk.profile(plan),
    queryFn: () => getProfile(plan),
  });
}
