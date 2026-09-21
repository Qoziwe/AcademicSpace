import type { AuthResponse } from '@/mocks/handlers/auth';

import { notImplemented } from './client';

// Сигнатуры сознательно без аргументов: Фаза 8 спроектирует тело/ответ
// заново, здесь фиксируется только форма результата и точка переключения.
export function signUp(): Promise<AuthResponse> {
  return notImplemented('POST /auth/signup');
}

export function signIn(): Promise<AuthResponse> {
  return notImplemented('POST /auth/signin');
}
