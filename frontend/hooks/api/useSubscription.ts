/**
 * Подписка (`GET /api/v1/subscription/plans`,
 * `POST /api/v1/subscription/subscribe`, `POST /api/v1/subscription/cancel`).
 *  - `usePlans()` — тарифы для `<PlanCard>` (PAYWALL / PLAN_SELECTION);
 *  - `useSubscribe()` — оплата: на success активируем Premium в мок-сессии
 *    и инвалидируем профиль. Бекенд отвечает 409, если уже есть активная
 *    подписка дороже запрашиваемого тарифа (запрет даунгрейда) — текст
 *    ошибки показывает глобальный тост (`providers/query-client.ts`);
 *  - `useCancelSubscription()` — отменяет автопродление; Premium остаётся
 *    до конца оплаченного периода (`subscription.cancelAtPeriodEnd` в
 *    `useProfile()`), поэтому `session.plan` тут не трогаем — просто
 *    инвалидируем профиль.
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

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionApi.cancel(),
    onSuccess: () => {
      void qc.invalidateQueries();
    },
  });
}
