/**
 * Адаптер-seam ресурса «profile». Развилка мок/HTTP — по `ENV.useMocks`.
 */

import { ENV } from '@/constants/env';
import * as mock from '@/mocks/handlers/profile';
import type { Plan } from '@/stores/session';

import * as http from './http/profile';

export type ProfileResponse = mock.ProfileResponse;
export type ProfileSubscription = mock.ProfileSubscription;

export interface ProfileApi {
  getProfile(plan: Plan): Promise<ProfileResponse>;
}

export const profileApi: ProfileApi = {
  getProfile: ENV.useMocks ? mock.getProfile : http.getProfile,
};
