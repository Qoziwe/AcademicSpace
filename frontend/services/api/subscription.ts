/**
 * Адаптер-seam ресурса «subscription». Развилка мок/HTTP — по `ENV.useMocks`.
 * Оплата на моках — стейт-машина прототипа в `mocks/store.ts.payState`.
 */

import { ENV } from '@/constants/env';
import type { PlanSeed } from '@/mocks/fixtures';
import * as mock from '@/mocks/handlers/subscription';

import * as http from './http/subscription';

export type { PlanSeed };
export type SubscribeResponse = mock.SubscribeResponse;

export interface SubscriptionApi {
  getPlans(): Promise<PlanSeed[]>;
  subscribe(planId: PlanSeed['id']): Promise<SubscribeResponse>;
}

export const subscriptionApi: SubscriptionApi = {
  getPlans: ENV.useMocks ? mock.getPlans : http.getPlans,
  subscribe: ENV.useMocks ? mock.subscribe : http.subscribe,
};
