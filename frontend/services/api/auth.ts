/**
 * Адаптер-seam ресурса «auth». Хуки (`hooks/api/useAuth.ts`) импортируют
 * `authApi` отсюда и не знают, мок это или реальный бекенд — развилка по
 * `ENV.useMocks` живёт здесь (Фаза 4, роадмап). Фаза 8 = дописать
 * `services/api/http/auth.ts`.
 */

import { ENV } from '@/constants/env';
import * as mock from '@/mocks/handlers/auth';

import * as http from './http/auth';

export type AuthResponse = mock.AuthResponse;
export type AuthUser = mock.AuthUser;
export type SignInBody = mock.SignInBody;
export type SignUpBody = mock.SignUpBody;

export interface AuthApi {
  signUp(body: SignUpBody): Promise<AuthResponse>;
  signIn(body: SignInBody): Promise<AuthResponse>;
}

export const authApi: AuthApi = ENV.useMocks
  ? { signUp: mock.signUp, signIn: mock.signIn }
  : { signUp: http.signUp, signIn: http.signIn };
