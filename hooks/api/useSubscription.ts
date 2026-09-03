/**
 * Подписка (`GET /api/v1/subscription/plans`,
 * `POST /api/v1/subscription/subscribe`).
 *  - `usePlans()` — тарифы для `<PlanCard>` (PAYWALL / PLAN_SELECTION);
 *  - `useSubscribe()` — оплата: на success активируем Premium в мок-сессии
 *    и инвалидируем профиль.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { qk } from '@/hooks/api/keys';
import { subscriptionApi, type PlanSeed } from '@/services/api/subscription';
import { useSessionStore } from '@/stores/session';

export function usePlans() {
  return useQuery({ queryKey: qk.plans(), queryFn: subscriptionApi.getPlans });
}

export function useSubscribe() {
  const qc = useQueryClient();
  const setPlan = useSessionStore((s) => s.setPlan);
  return useMutation({
    mutationFn: (planId: PlanSeed['id']) => subscriptionApi.subscribe(planId),
    onSuccess: () => {
      setPlan('premium');
      void qc.invalidateQueries();
    },
  });
}
