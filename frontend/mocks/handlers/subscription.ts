/**
 * Мок-хендлер подписки. Контракт — `docs/api-contract.md` §Subscription
 * (`GET /api/v1/subscription/plans`, `POST /api/v1/subscription/subscribe`,
 * `POST /api/v1/subscription/cancel`).
 *
 * Оплата — стейт-машина прототипа (`pay`): idle → processing → success
 * через `setTimeout`; на success активируем Premium. Тариф активной
 * подписки и флаг отмены живут в `mocks/store.ts`, чтобы повторять
 * бекенд-поведение «нельзя понизить тариф, пока действует текущий» и
 * «отмена = не отбирает Premium раньше конца периода».
 */

import { delay } from '@/mocks/delay';
import { PLANS, SUBSCRIPTION_RENEWS_AT, type PlanSeed } from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';

export function getPlans(): Promise<PlanSeed[]> {
  return delay(PLANS);
}

export interface SubscribeResponse {
  status: 'success';
  subscription: { period: string; renewsAt: string };
}

export class SubscriptionApiError extends Error {}

export function subscribe(planId: PlanSeed['id']): Promise<SubscribeResponse> {
  const { subscribedPlanId } = useMockStore.getState();
  const plan = PLANS.find((p) => p.id === planId);
  const currentPlan = PLANS.find((p) => p.id === subscribedPlanId);

  if (plan && currentPlan && plan.amount < currentPlan.amount) {
    return Promise.reject(
      new SubscriptionApiError(
        `Нельзя перейти на более дешёвый тариф, пока действует текущая подписка (${currentPlan.period.toLowerCase()}). Доступно после ${SUBSCRIPTION_RENEWS_AT}.`,
      ),
    );
  }

  useMockStore.getState().setSubscribedPlanId(planId);

  return delay(
    {
      status: 'success',
      subscription: { period: plan?.period ?? '', renewsAt: SUBSCRIPTION_RENEWS_AT },
    },
    1900,
  );
}

export interface CancelResponse {
  status: 'success';
  endsAt: string;
}

export function cancel(): Promise<CancelResponse> {
  const { subscribedPlanId, subscriptionCancelPending } = useMockStore.getState();

  if (!subscribedPlanId) {
    return Promise.reject(new SubscriptionApiError('Активной подписки нет.'));
  }
  if (subscriptionCancelPending) {
    return Promise.reject(new SubscriptionApiError('Автопродление уже отменено.'));
  }

  useMockStore.getState().setSubscriptionCancelPending(true);

  return delay({ status: 'success', endsAt: SUBSCRIPTION_RENEWS_AT });
}
