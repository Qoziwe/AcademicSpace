/**
 * Мок-хендлер профиля. Контракт — `docs/api-contract.md` §Profile
 * (`GET /api/v1/profile/me`).
 *
 * `plan` на этапе моков — клиентский стейт (`stores/session.ts`), поэтому
 * передаётся аргументом; реальный эндпоинт вернёт его сам.
 */

import { delay } from '@/mocks/delay';
import { PROFILE } from '@/mocks/fixtures';
import type { Plan } from '@/stores/session';

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
  subscription: { period: string; renewsAt: string } | null;
}

export function getProfile(plan: Plan): Promise<ProfileResponse> {
  return delay({
    id: PROFILE.id,
    name: PROFILE.name,
    email: PROFILE.email,
    grade: PROFILE.grade,
    avatarUrl: PROFILE.avatarUrl,
    level: PROFILE.level,
    xp: PROFILE.xp,
    xpToNextLevel: PROFILE.xpToNextLevel,
    matchesCount: PROFILE.matchesCount,
    rating: PROFILE.rating,
    plan,
    subscription: plan === 'premium' ? { period: 'month', renewsAt: '12 мая' } : null,
  });
}
