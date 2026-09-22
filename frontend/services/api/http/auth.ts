import type { AuthResponse, SignInBody, SignUpBody } from '@/mocks/handlers/auth';

import { apiFetch } from './client';

export function signUp(body: SignUpBody): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('POST', '/auth/signup', body);
}

export function signIn(body: SignInBody): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('POST', '/auth/signin', body);
}
