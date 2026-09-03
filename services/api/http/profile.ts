import type { ProfileResponse } from '@/mocks/handlers/profile';

import { apiFetch } from './client';

// Реальный бекенд вернёт план и подписку сам — аргумент `plan` не нужен.
export function getProfile(): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>('GET', '/profile/me');
}
