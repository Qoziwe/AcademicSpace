/**
 * Мок-хендлер профиля. Контракт — `docs/api-contract.md` §Profile
 * (`GET /api/v1/profile/me`).
 *
 * `plan` на этапе моков — клиентский стейт (`stores/session.ts`), поэтому
 * передаётся аргументом; реальный эндпоинт вернёт его сам. `xp` растёт в
 * `mocks/store.ts` при закрытии модулей — берём оттуда, а не из фикстуры.
 */

import { delay } from '@/mocks/delay';
import {
  ACTIVE_PLAN_ID,
  DASHBOARD,
  PLANS,
  PROFILE,
  SUBSCRIPTION_RENEWS_AT,
} from '@/mocks/fixtures';
import { useMockStore } from '@/mocks/store';
import type { Plan } from '@/stores/session';

export interface ProfileSubscription {
  period: string;
  periodLabel: string;
  price: string;
  renewsAt: string;
  /** Готовая строка «Месяц · 1 900 тг · продлится 12 мая» для карточек подписки. */
  summary: string;
}

export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  grade: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  xpToNextLevel: number;
  matchesCount: number;
  rating: number;
  plan: Plan;
  subscription: ProfileSubscription | null;
  /** Подпись строки «Подписка» в профиле для обоих тарифов. */
  subscriptionRowSub: string;
  /** Подпись зоны анализа на дашборде. */
  analysis: { country: string; sinceLabel: string };
  /** Плитки-статы карточки профиля на дашборде. */
  dashboardStats: { v: string; k: string }[];
}

export function getProfile(plan: Plan): Promise<ProfileResponse> {
  const { xp, filters } = useMockStore.getState();
  const activePlan = PLANS.find((p) => p.id === ACTIVE_PLAN_ID) ?? PLANS[1] ?? PLANS[0];
  const weekPlan = PLANS.find((p) => p.id === 'week') ?? PLANS[0];

  const subscription: ProfileSubscription | null =
    plan === 'premium' && activePlan
      ? {
          period: activePlan.id,
          periodLabel: activePlan.period,
          price: activePlan.price,
          renewsAt: SUBSCRIPTION_RENEWS_AT,
          summary: `${activePlan.period} · ${activePlan.price} · продлится ${SUBSCRIPTION_RENEWS_AT}`,
        }
      : null;

  return delay({
    id: PROFILE.id,
    name: PROFILE.name,
    email: PROFILE.email,
    grade: PROFILE.grade,
    avatarUrl: PROFILE.avatarUrl,
    level: PROFILE.level,
    xp,
    xpToNextLevel: PROFILE.xpToNextLevel,
    matchesCount: PROFILE.matchesCount,
    rating: PROFILE.rating,
    plan,
    subscription,
    subscriptionRowSub:
      plan === 'premium'
        ? `Premium · продлится ${SUBSCRIPTION_RENEWS_AT}`
        : `Базовый доступ · ${weekPlan?.price ?? ''} / неделя`,
    analysis: { country: filters.country, sinceLabel: DASHBOARD.analysisSinceLabel },
    dashboardStats: [
      { v: String(PROFILE.rating), k: 'рейтинг' },
      {
        v: `${DASHBOARD.questionnaireFieldCount}/${DASHBOARD.questionnaireFieldCount}`,
        k: 'полей',
      },
      { v: filters.country, k: 'страна подбора' },
    ],
  });
}
