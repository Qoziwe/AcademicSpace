/**
 * Мок-хендлер подписки. Контракт — `docs/api-contract.md` §Subscription
 * (`GET /api/v1/subscription/plans`, `POST /api/v1/subscription/subscribe`).
 *
 * Оплата — стейт-машина прототипа (`pay`): idle → processing → success
 * через `setTimeout`; на success активируем Premium.
 */

import { delay } from '@/mocks/delay';
import { PLANS, type PlanSeed } from '@/mocks/fixtures';

export function getPlans(): Promise<PlanSeed[]> {
  return delay(PLANS);
}

export interface SubscribeResponse {
  status: 'success';
  subscription: { period: string; renewsAt: string };
}

export function subscribe(planId: PlanSeed['id']): Promise<SubscribeResponse> {
  return delay(
    {
      status: 'success',
      subscription: { period: planId === 'week' ? 'Неделя' : 'Месяц', renewsAt: '12 мая' },
    },
    1900,
  );
}
