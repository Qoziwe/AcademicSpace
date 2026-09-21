/**
 * Мок-хендлер авторизации. Контракт — `docs/api-contract.md` §Auth
 * (`POST /api/v1/auth/signup`, `POST /api/v1/auth/signin`).
 * Настоящей проверки нет (`CLAUDE.md` §11) — просто отдаём токен и юзера.
 */

import { delay } from '@/mocks/delay';
import { PROFILE } from '@/mocks/fixtures';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  grade: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface SignUpBody {
  email: string;
  password: string;
  name: string;
  grade: string;
}

export interface SignInBody {
  email: string;
  password: string;
}

export function signUp(body: SignUpBody): Promise<AuthResponse> {
  return delay({
    token: 'mock-token',
    user: {
      id: PROFILE.id,
      name: body.name.trim() || PROFILE.name,
      email: body.email.trim() || PROFILE.email,
      grade: body.grade.trim() || PROFILE.grade,
    },
  });
}

export function signIn(body: SignInBody): Promise<AuthResponse> {
  return delay({
    token: 'mock-token',
    user: {
      id: PROFILE.id,
      name: PROFILE.name,
      email: body.email.trim() || PROFILE.email,
      grade: PROFILE.grade,
    },
  });
}
