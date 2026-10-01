import type { PlanSeed } from '@/mocks/fixtures';
import type { CancelResponse, SubscribeResponse } from '@/mocks/handlers/subscription';

import { apiFetch } from './client';

export function getPlans(): Promise<PlanSeed[]> {
  return apiFetch<PlanSeed[]>('GET', '/subscription/plans');
}

export function subscribe(planId: PlanSeed['id']): Promise<SubscribeResponse> {
  return apiFetch<SubscribeResponse>('POST', '/subscription/subscribe', { planId });
}

export function cancel(): Promise<CancelResponse> {
  return apiFetch<CancelResponse>('POST', '/subscription/cancel');
}
