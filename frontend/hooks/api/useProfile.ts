/**
 * `useProfile()` — профиль пользователя (`GET /api/v1/profile/me`).
 * Форма ответа зафиксирована в `docs/api-contract.md`.
 *
 * `session.plan` — локальный премиум-гейт (`usePremiumGate`, таб-бар,
 * lock-тизеры), но бекенд — источник правды для `plan`. Синхронизируем
 * сюда при каждом успешном ответе, иначе гейты расходятся с реальным
 * тарифом (напр. после входа уже премиум-аккаунтом или после отмены
 * подписки на бекенде).
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { qk } from '@/hooks/api/keys';
import { profileApi } from '@/services/api/profile';
import { useSessionStore } from '@/stores/session';

export function useProfile() {
  const plan = useSessionStore((s) => s.plan);
  const setPlan = useSessionStore((s) => s.setPlan);
  const query = useQuery({
    queryKey: qk.profile(plan),
    queryFn: () => profileApi.getProfile(plan),
  });

  useEffect(() => {
    if (query.data && query.data.plan !== plan) {
      setPlan(query.data.plan);
    }
  }, [query.data, plan, setPlan]);

  return query;
}
