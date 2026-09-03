import type { PlanSeed } from '@/mocks/fixtures';
import type { SubscribeResponse } from '@/mocks/handlers/subscription';

import { apiFetch, notImplemented } from './client';

export function getPlans(): Promise<PlanSeed[]> {
  return apiFetch<PlanSeed[]>('GET', '/subscription/plans');
}

export function subscribe(): Promise<SubscribeResponse> {
  // Платёжный провайдер и вебхук активации — Фаза 8.
  return notImplemented('POST /subscription/subscribe');
}
