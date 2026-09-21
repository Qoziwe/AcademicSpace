/**
 * Premium-гейт как переиспользуемый hook (`CLAUDE.md` §6).
 *
 * Два паттерна гейтинга из прототипа:
 *  1. Hard-hide — элемент (таб «Задачи», блок «Активные задачи» на дашборде)
 *     физически не рендерится для Free. Реализуется через `isPremium`.
 *  2. Lock-тизер — bento-плитка / строка профиля рендерится всегда, но по
 *     тапу ведёт на PAYWALL вместо целевого экрана. Реализуется через
 *     `resolveHref(target, { premium: true })`.
 *
 * Route-guard самих Premium-роутов (редирект Free → Paywall при прямом
 * заходе) — отдельно, в `navigation/withGuard.tsx`.
 */

import type { Href } from 'expo-router';
import { useCallback } from 'react';

import { ROUTES } from '@/navigation/registry';
import { selectIsPremium, useSessionStore } from '@/stores/session';

const PAYWALL_HREF: Href = ROUTES.PAYWALL.demoHref;

export interface PremiumGate {
  isPremium: boolean;
  /** href цели, если можно; иначе href пейвола. `locked` можно задать явно (напр. плитка premium && !P). */
  resolveHref: (target: Href, opts?: { locked?: boolean }) => Href;
  paywallHref: Href;
}

export function usePremiumGate(): PremiumGate {
  const isPremium = useSessionStore(selectIsPremium);

  const resolveHref = useCallback(
    (target: Href, opts?: { locked?: boolean }): Href => {
      const locked = opts?.locked ?? !isPremium;
      return locked ? PAYWALL_HREF : target;
    },
    [isPremium],
  );

  return { isPremium, resolveHref, paywallHref: PAYWALL_HREF };
}
