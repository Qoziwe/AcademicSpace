import type { PlanSeed } from '@/mocks/fixtures';
import type { SubscribeResponse } from '@/mocks/handlers/subscription';

import { apiFetch } from './client';

export function getPlans(): Promise<PlanSeed[]> {
  return apiFetch<PlanSeed[]>('GET', '/subscription/plans');
}

export function subscribe(planId: PlanSeed['id']): Promise<SubscribeResponse> {
  return apiFetch<SubscribeResponse>('POST', '/subscription/subscribe', { planId });
}
